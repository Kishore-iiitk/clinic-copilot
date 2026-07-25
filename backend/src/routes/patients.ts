import { Router, type IRouter } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db, patientsTable, vitalsTable, notesTable } from "../db";
import {
  CreatePatientBody,
  GetPatientParams,
  GetPatientVitalsParams,
  AddVitalsParams,
  AddVitalsBody,
  GetPatientNotesParams,
  CreatePatientNoteParams,
  CreatePatientNoteBody,
  DeletePatientNoteParams,
} from "../validators";
import { computeRisk } from "../lib/risk";

const router: IRouter = Router();

// Helper to get latest vitals + risk for a patient
async function getPatientSummary(patientId: number) {
  const patient = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.id, patientId))
    .limit(1);

  if (!patient[0]) return null;

  const history = await db
    .select()
    .from(vitalsTable)
    .where(eq(vitalsTable.patientId, patientId))
    .orderBy(asc(vitalsTable.recordedAt));

  const latest = history[history.length - 1];
  if (!latest) return null;

  const { risk, riskReason } = computeRisk(history);

  const formatVitals = (v: typeof latest) => ({
    id: v.id,
    patientId: v.patientId,
    recordedAt: v.recordedAt.toISOString(),
    heartRate: v.heartRate,
    spo2: v.spo2,
    bpSystolic: v.bpSystolic,
    bpDiastolic: v.bpDiastolic,
    temperature: Number(v.temperature),
    respiratoryRate: v.respiratoryRate,
  });

  return {
    id: patient[0].id,
    name: patient[0].name,
    bedNumber: patient[0].bedNumber,
    age: patient[0].age,
    ward: patient[0].ward,
    diagnosis: patient[0].diagnosis,
    risk,
    riskReason,
    latestVitals: formatVitals(latest),
  };
}

// GET /patients
router.get("/patients", async (req, res): Promise<void> => {
  const patients = await db
    .select()
    .from(patientsTable)
    .orderBy(asc(patientsTable.id));
  const summaries = await Promise.all(
    patients.map((p) => getPatientSummary(p.id)),
  );
  res.json(summaries.filter(Boolean));
});

// POST /patients (Nurse: add a new patient + initial vitals reading)
router.post("/patients", async (req, res): Promise<void> => {
  const body = CreatePatientBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [insertedPatient] = await db
    .insert(patientsTable)
    .values({
      name: body.data.name,
      bedNumber: body.data.bedNumber,
      age: body.data.age,
      ward: body.data.ward,
      diagnosis: body.data.diagnosis,
    })
    .returning();

  await db.insert(vitalsTable).values({
    patientId: insertedPatient.id,
    heartRate: body.data.heartRate,
    spo2: body.data.spo2,
    bpSystolic: body.data.bpSystolic,
    bpDiastolic: body.data.bpDiastolic,
    temperature: String(body.data.temperature),
    respiratoryRate: body.data.respiratoryRate,
  });

  const summary = await getPatientSummary(insertedPatient.id);
  res.status(201).json(summary);
});

// GET /patients/:id
router.get("/patients/:id", async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const patient = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.id, params.data.id))
    .limit(1);

  if (!patient[0]) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  const history = await db
    .select()
    .from(vitalsTable)
    .where(eq(vitalsTable.patientId, params.data.id))
    .orderBy(asc(vitalsTable.recordedAt));

  const latest = history[history.length - 1];
  if (!latest) {
    res.status(404).json({ error: "No vitals found for patient" });
    return;
  }

  const { risk, riskReason } = computeRisk(history);

  const formatVitals = (v: typeof latest) => ({
    id: v.id,
    patientId: v.patientId,
    recordedAt: v.recordedAt.toISOString(),
    heartRate: v.heartRate,
    spo2: v.spo2,
    bpSystolic: v.bpSystolic,
    bpDiastolic: v.bpDiastolic,
    temperature: Number(v.temperature),
    respiratoryRate: v.respiratoryRate,
  });

  res.json({
    id: patient[0].id,
    name: patient[0].name,
    bedNumber: patient[0].bedNumber,
    age: patient[0].age,
    ward: patient[0].ward,
    diagnosis: patient[0].diagnosis,
    risk,
    riskReason,
    latestVitals: formatVitals(latest),
    vitalsHistory: history.map(formatVitals),
  });
});

// GET /patients/:id/vitals
router.get("/patients/:id/vitals", async (req, res): Promise<void> => {
  const params = GetPatientVitalsParams.safeParse({
    id: Number(req.params.id),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const history = await db
    .select()
    .from(vitalsTable)
    .where(eq(vitalsTable.patientId, params.data.id))
    .orderBy(asc(vitalsTable.recordedAt));

  res.json(
    history.map((v) => ({
      id: v.id,
      patientId: v.patientId,
      recordedAt: v.recordedAt.toISOString(),
      heartRate: v.heartRate,
      spo2: v.spo2,
      bpSystolic: v.bpSystolic,
      bpDiastolic: v.bpDiastolic,
      temperature: Number(v.temperature),
      respiratoryRate: v.respiratoryRate,
    })),
  );
});

// POST /patients/:id/vitals
router.post("/patients/:id/vitals", async (req, res): Promise<void> => {
  const params = AddVitalsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AddVitalsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [inserted] = await db
    .insert(vitalsTable)
    .values({
      patientId: params.data.id,
      heartRate: body.data.heartRate,
      spo2: body.data.spo2,
      bpSystolic: body.data.bpSystolic,
      bpDiastolic: body.data.bpDiastolic,
      temperature: String(body.data.temperature),
      respiratoryRate: body.data.respiratoryRate,
    })
    .returning();

  res.status(201).json({
    id: inserted.id,
    patientId: inserted.patientId,
    recordedAt: inserted.recordedAt.toISOString(),
    heartRate: inserted.heartRate,
    spo2: inserted.spo2,
    bpSystolic: inserted.bpSystolic,
    bpDiastolic: inserted.bpDiastolic,
    temperature: Number(inserted.temperature),
    respiratoryRate: inserted.respiratoryRate,
  });
});

// GET /patients/:id/notes
router.get("/patients/:id/notes", async (req, res): Promise<void> => {
  const params = GetPatientNotesParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const notes = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.patientId, params.data.id))
    .orderBy(asc(notesTable.createdAt));

  res.json(
    notes.map((n) => ({
      id: n.id,
      patientId: n.patientId,
      createdAt: n.createdAt.toISOString(),
      role: n.role,
      rawText: n.rawText,
      isSoap: n.isSoap,
      soapSubjective: n.soapSubjective ?? null,
      soapObjective: n.soapObjective ?? null,
      soapAssessment: n.soapAssessment ?? null,
      soapPlan: n.soapPlan ?? null,
    })),
  );
});

// POST /patients/:id/notes
router.post("/patients/:id/notes", async (req, res): Promise<void> => {
  const params = CreatePatientNoteParams.safeParse({
    id: Number(req.params.id),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreatePatientNoteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [inserted] = await db
    .insert(notesTable)
    .values({
      patientId: params.data.id,
      role: body.data.role,
      rawText: body.data.rawText,
      isSoap: body.data.isSoap,
      soapSubjective: body.data.soapSubjective ?? null,
      soapObjective: body.data.soapObjective ?? null,
      soapAssessment: body.data.soapAssessment ?? null,
      soapPlan: body.data.soapPlan ?? null,
    })
    .returning();

  res.status(201).json({
    id: inserted.id,
    patientId: inserted.patientId,
    createdAt: inserted.createdAt.toISOString(),
    role: inserted.role,
    rawText: inserted.rawText,
    isSoap: inserted.isSoap,
    soapSubjective: inserted.soapSubjective ?? null,
    soapObjective: inserted.soapObjective ?? null,
    soapAssessment: inserted.soapAssessment ?? null,
    soapPlan: inserted.soapPlan ?? null,
  });
});

// DELETE /patients/:id/notes/:noteId
// Deletes the note from the database, so it disappears from both the
// Doctor and Nurse views since they read from the same shared notes list.
router.delete(
  "/patients/:id/notes/:noteId",
  async (req, res): Promise<void> => {
    const params = DeletePatientNoteParams.safeParse({
      id: Number(req.params.id),
      noteId: Number(req.params.noteId),
    });
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const deleted = await db
      .delete(notesTable)
      .where(
        and(
          eq(notesTable.id, params.data.noteId),
          eq(notesTable.patientId, params.data.id),
        ),
      )
      .returning();

    if (!deleted[0]) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.status(200).json({ success: true, id: deleted[0].id });
  },
);

// GET /alerts
router.get("/alerts", async (req, res): Promise<void> => {
  const patients = await db
    .select()
    .from(patientsTable)
    .orderBy(asc(patientsTable.id));
  const summaries = await Promise.all(
    patients.map((p) => getPatientSummary(p.id)),
  );
  const alerts = summaries.filter(
    (s) => s && (s.risk === "amber" || s.risk === "red"),
  );
  // Sort: red first, then amber
  alerts.sort((a, b) => {
    if (!a || !b) return 0;
    if (a.risk === "red" && b.risk !== "red") return -1;
    if (a.risk !== "red" && b.risk === "red") return 1;
    return 0;
  });
  res.json(alerts);
});

export default router;
