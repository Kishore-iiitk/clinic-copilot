import { db, patientsTable, vitalsTable, notesTable } from "../db";
import { logger } from "./logger";

const SEED_PATIENTS = [
  { name: "Priya Ramachandran", bedNumber: "A-01", age: 58, ward: "General Medicine", diagnosis: "Type 2 Diabetes, Hypertension" },
  { name: "Muthu Krishnan", bedNumber: "A-02", age: 72, ward: "General Medicine", diagnosis: "COPD, Bronchitis" },
  { name: "Anitha Selvam", bedNumber: "A-03", age: 45, ward: "Cardiology", diagnosis: "Atrial Fibrillation, Dyspnea" },
  { name: "Rajan Pillai", bedNumber: "B-01", age: 63, ward: "General Medicine", diagnosis: "Pneumonia, Fever" },
  { name: "Kavitha Nair", bedNumber: "B-02", age: 34, ward: "Obstetrics", diagnosis: "Preeclampsia, 36 weeks" },
  { name: "Suresh Babu", bedNumber: "B-03", age: 81, ward: "Geriatrics", diagnosis: "Fall injury, Confusion" },
  { name: "Deepa Mohan", bedNumber: "C-01", age: 52, ward: "Neurology", diagnosis: "Stroke recovery, Weakness" },
];

// Baseline stable vitals per patient (slightly different for realism)
const BASELINES = [
  { hr: 80, spo2: 97, bpS: 138, bpD: 86, temp: 37.0, rr: 16 },  // Priya - stable HTN
  { hr: 88, spo2: 93, bpS: 124, bpD: 78, temp: 37.2, rr: 20 },  // Muthu - COPD, lower SpO2
  { hr: 95, spo2: 96, bpS: 130, bpD: 82, temp: 37.1, rr: 18 },  // Anitha - afib, higher HR
  { hr: 92, spo2: 95, bpS: 128, bpD: 80, temp: 38.4, rr: 22 },  // Rajan - pneumonia, fever
  { hr: 86, spo2: 98, bpS: 152, bpD: 98, temp: 37.3, rr: 17 },  // Kavitha - high BP
  { hr: 74, spo2: 96, bpS: 118, bpD: 72, temp: 37.0, rr: 16 },  // Suresh - stable
  { hr: 78, spo2: 97, bpS: 122, bpD: 76, temp: 37.0, rr: 15 },  // Deepa - stable
];

function jitter(base: number, maxDelta: number): number {
  return Math.round(base + (Math.random() - 0.5) * 2 * maxDelta);
}

function jitterF(base: number, maxDelta: number): number {
  return parseFloat((base + (Math.random() - 0.5) * 2 * maxDelta).toFixed(1));
}

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select().from(patientsTable).limit(1);
  if (existing.length > 0) {
    logger.info("Database already seeded, skipping");
    return;
  }

  logger.info("Seeding database with Ward Copilot demo data");

  const insertedPatients = await db.insert(patientsTable).values(SEED_PATIENTS).returning();

  const now = Date.now();
  const READING_INTERVAL_MS = 18 * 60 * 1000; // 18 min apart = 10 readings over 3 hrs

  for (let i = 0; i < insertedPatients.length; i++) {
    const patient = insertedPatients[i];
    const base = BASELINES[i];

    for (let r = 0; r < 10; r++) {
      const recordedAt = new Date(now - (9 - r) * READING_INTERVAL_MS);
      await db.insert(vitalsTable).values({
        patientId: patient.id,
        recordedAt,
        heartRate: jitter(base.hr, 3),
        spo2: jitter(base.spo2, 1),
        bpSystolic: jitter(base.bpS, 4),
        bpDiastolic: jitter(base.bpD, 3),
        temperature: jitterF(base.temp, 0.2),
        respiratoryRate: jitter(base.rr, 1),
      });
    }
  }

  // Seed one clinical note per patient
  const sampleNotes = [
    { role: "Doctor", rawText: "Patient reports feeling dizzy since morning. Blood sugar 220 mg/dL on arrival.", isSoap: true, soapSubjective: "Patient reports dizziness since morning, increased thirst.", soapObjective: "Blood sugar 220 mg/dL. BP 138/86. HR 80.", soapAssessment: "Uncontrolled T2DM with possible hyperglycemic episode.", soapPlan: "Adjust insulin dose. Recheck BG in 2 hours. Encourage fluids." },
    { role: "Nurse", rawText: "Patient requiring supplemental O2 2L nasal cannula. Wheezing on auscultation.", isSoap: false, soapSubjective: null, soapObjective: null, soapAssessment: null, soapPlan: null },
    { role: "Doctor", rawText: "Palpitations ongoing. ECG shows irregular rhythm consistent with AF. Rate controlled on metoprolol.", isSoap: true, soapSubjective: "Palpitations and mild shortness of breath.", soapObjective: "ECG: atrial fibrillation. HR 95. SpO2 96%.", soapAssessment: "AF with moderate rate, rate controlled.", soapPlan: "Continue metoprolol. Monitor daily ECG. Anticoagulation review tomorrow." },
    { role: "Nurse", rawText: "Temp 38.4. Given paracetamol 1g. Patient complaining of chest pain on deep breath.", isSoap: false, soapSubjective: null, soapObjective: null, soapAssessment: null, soapPlan: null },
    { role: "Doctor", rawText: "BP 152/98. Fetal movements normal. Patient on bed rest. Proteinuria 2+.", isSoap: true, soapSubjective: "Headache and swelling in feet.", soapObjective: "BP 152/98. Proteinuria 2+. FHR 140.", soapAssessment: "Preeclampsia, 36 weeks gestation.", soapPlan: "Bed rest. Labetalol 100mg TDS. Repeat BP q4h. Obstetrics review." },
    { role: "Nurse", rawText: "Patient confused about time and place. Safety rail raised. Family notified.", isSoap: false, soapSubjective: null, soapObjective: null, soapAssessment: null, soapPlan: null },
    { role: "Doctor", rawText: "Physiotherapy session done. Left arm weakness improving. Speech slightly slurred but better than yesterday.", isSoap: true, soapSubjective: "Weakness in left arm, mild speech difficulty.", soapObjective: "Left grip strength 3/5. Speech mildly dysarthric.", soapAssessment: "Stroke recovery, progressing well.", soapPlan: "Continue physiotherapy BID. Speech therapy assessment. Aspirin 75mg. Follow-up MRI in 72h." },
  ];

  for (let i = 0; i < insertedPatients.length; i++) {
    const patient = insertedPatients[i];
    const n = sampleNotes[i];
    await db.insert(notesTable).values({
      patientId: patient.id,
      role: n.role,
      rawText: n.rawText,
      isSoap: n.isSoap,
      soapSubjective: n.soapSubjective ?? null,
      soapObjective: n.soapObjective ?? null,
      soapAssessment: n.soapAssessment ?? null,
      soapPlan: n.soapPlan ?? null,
    });
  }

  logger.info("Database seeded successfully with 7 patients, vitals history, and notes");
}
