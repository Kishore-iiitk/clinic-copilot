import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, patientsTable, vitalsTable } from "../db";
import { computeRisk } from "../lib/risk";

const router: IRouter = Router();

// Track which patients are "deteriorating" across simulation steps
// Patients at index 2 (Anitha) and 4 (Kavitha) will deteriorate
// They recover after 30+ steps to cycle back
let simulationStep = 0;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function jitter(val: number, delta: number): number {
  return Math.round(val + (Math.random() - 0.5) * 2 * delta);
}

// POST /simulate-shift
router.post("/simulate-shift", async (req, res): Promise<void> => {
  simulationStep++;
  const step = simulationStep;

  const patients = await db.select().from(patientsTable).orderBy(asc(patientsTable.id));

  const now = new Date();

  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const history = await db
      .select()
      .from(vitalsTable)
      .where(eq(vitalsTable.patientId, patient.id))
      .orderBy(asc(vitalsTable.recordedAt));

    const last = history[history.length - 1];
    if (!last) continue;

    let hr = last.heartRate;
    let spo2 = last.spo2;
    let bpS = last.bpSystolic;
    let bpD = last.bpDiastolic;
    let temp = Number(last.temperature);
    let rr = last.respiratoryRate;

    // Patient index 2 (Anitha - Afib) and index 4 (Kavitha - Preeclampsia) deteriorate
    const isDeteriorating2 = i === 2 && step <= 30;
    const isDeteriorating4 = i === 4 && step >= 10 && step <= 35;

    if (isDeteriorating2) {
      // Anitha: HR rises, SpO2 drops
      hr = clamp(jitter(hr + 1.2, 2), 60, 180);
      spo2 = clamp(jitter(spo2 - 0.3, 1), 80, 100);
      bpS = clamp(jitter(bpS + 0.5, 3), 80, 220);
      rr = clamp(jitter(rr + 0.2, 1), 8, 40);
    } else if (isDeteriorating4) {
      // Kavitha: BP rises sharply
      bpS = clamp(jitter(bpS + 1.5, 3), 80, 230);
      bpD = clamp(jitter(bpD + 1.0, 2), 50, 140);
      hr = clamp(jitter(hr + 0.5, 2), 50, 160);
    } else {
      // All other patients: small random jitter (normal variation)
      hr = clamp(jitter(hr, 3), 50, 150);
      spo2 = clamp(jitter(spo2, 1), 85, 100);
      bpS = clamp(jitter(bpS, 4), 80, 200);
      bpD = clamp(jitter(bpD, 3), 50, 130);
      temp = parseFloat(Math.max(36.0, Math.min(40.5, temp + (Math.random() - 0.5) * 0.2)).toFixed(1));
      rr = clamp(jitter(rr, 1), 8, 35);
    }

    await db.insert(vitalsTable).values({
      patientId: patient.id,
      recordedAt: now,
      heartRate: hr,
      spo2,
      bpSystolic: bpS,
      bpDiastolic: bpD,
      temperature: String(temp),
      respiratoryRate: rr,
    });
  }

  // Return updated patient summaries
  const updatedPatients = await db.select().from(patientsTable).orderBy(asc(patientsTable.id));

  const summaries = await Promise.all(
    updatedPatients.map(async (patient) => {
      const history = await db
        .select()
        .from(vitalsTable)
        .where(eq(vitalsTable.patientId, patient.id))
        .orderBy(asc(vitalsTable.recordedAt));

      const latest = history[history.length - 1];
      if (!latest) return null;

      const { risk, riskReason } = computeRisk(history);

      return {
        id: patient.id,
        name: patient.name,
        bedNumber: patient.bedNumber,
        age: patient.age,
        ward: patient.ward,
        diagnosis: patient.diagnosis,
        risk,
        riskReason,
        latestVitals: {
          id: latest.id,
          patientId: latest.patientId,
          recordedAt: latest.recordedAt.toISOString(),
          heartRate: latest.heartRate,
          spo2: latest.spo2,
          bpSystolic: latest.bpSystolic,
          bpDiastolic: latest.bpDiastolic,
          temperature: Number(latest.temperature),
          respiratoryRate: latest.respiratoryRate,
        },
      };
    })
  );

  res.json(summaries.filter(Boolean));
});

export default router;
