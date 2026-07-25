import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetPatient,
  useGetPatientNotes,
  useExplainRisk,
  useTranslateText,
  useAddVitals,
  useCreatePatientNote,
  getGetPatientQueryKey,
  getGetPatientNotesQueryKey,
  getGetPatientVitalsQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/patient/RiskBadge";
import { VitalsChart } from "@/components/patient/VitalsChart";
import {
  ArrowLeft, Mic, Languages, FileText, BrainCircuit, Activity,
  Clock, HeartPulse, Thermometer, Wind, Droplet, Save, Loader2,
  Plus, CheckCircle, AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRole } from "@/context/RoleContext";
import { motion, AnimatePresence } from "framer-motion";

// ─── Nurse: Inline Vitals Entry ──────────────────────────────────────────────
function NurseVitalsForm({ patientId }: { patientId: number }) {
  const queryClient = useQueryClient();
  const addVitals = useAddVitals();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    heartRate: "",
    spo2: "",
    bpSystolic: "",
    bpDiastolic: "",
    temperature: "",
    respiratoryRate: "",
  });

  const handleSubmit = () => {
    const data = {
      heartRate: parseInt(form.heartRate),
      spo2: parseInt(form.spo2),
      bpSystolic: parseInt(form.bpSystolic),
      bpDiastolic: parseInt(form.bpDiastolic),
      temperature: parseFloat(form.temperature),
      respiratoryRate: parseInt(form.respiratoryRate),
    };
    if (Object.values(data).some(isNaN)) return;

    addVitals.mutate(
      { id: patientId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(patientId) });
          queryClient.invalidateQueries({ queryKey: getGetPatientVitalsQueryKey(patientId) });
          setSaved(true);
          setForm({ heartRate: "", spo2: "", bpSystolic: "", bpDiastolic: "", temperature: "", respiratoryRate: "" });
          setTimeout(() => { setSaved(false); setOpen(false); }, 2000);
        },
      }
    );
  };

  const fields = [
    { key: "heartRate", label: "Heart Rate", unit: "bpm", icon: <HeartPulse className="w-4 h-4 text-rose-500" />, type: "integer" },
    { key: "spo2", label: "SpO2", unit: "%", icon: <Wind className="w-4 h-4 text-blue-500" />, type: "integer" },
    { key: "bpSystolic", label: "BP Systolic", unit: "mmHg", icon: <Droplet className="w-4 h-4 text-orange-500" />, type: "integer" },
    { key: "bpDiastolic", label: "BP Diastolic", unit: "mmHg", icon: <Droplet className="w-4 h-4 text-orange-400" />, type: "integer" },
    { key: "temperature", label: "Temperature", unit: "°C", icon: <Thermometer className="w-4 h-4 text-amber-500" />, type: "decimal" },
    { key: "respiratoryRate", label: "Resp Rate", unit: "/min", icon: <Activity className="w-4 h-4 text-teal-500" />, type: "integer" },
  ] as const;

  return (
    <div className="space-y-3">
      {!open ? (
        <Button
          size="lg"
          className="w-full md:w-auto shadow-md gap-2 bg-teal-600 hover:bg-teal-700 text-white"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-5 h-5" /> Log Vitals
        </Button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="border-teal-200 shadow-md bg-white">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-teal-600" />
                    Log Vitals Reading
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">{format(new Date(), "h:mm a")}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {fields.map(({ key, label, unit, icon, type }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                        {icon} {label}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={type === "decimal" ? "0.1" : "1"}
                          value={form[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder="—"
                          className="w-full px-3 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
                          {unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleSubmit}
                    disabled={addVitals.isPending || saved}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                  >
                    {saved ? (
                      <><CheckCircle className="w-4 h-4 mr-2" /> Saved</>
                    ) : addVitals.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Reading</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-200">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Nurse: Quick Observation Note ───────────────────────────────────────────
function NurseObservationForm({ patientId }: { patientId: number }) {
  const queryClient = useQueryClient();
  const createNote = useCreatePatientNote();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    createNote.mutate(
      {
        id: patientId,
        data: { role: "Nurse", rawText: text.trim(), isSoap: false },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPatientNotesQueryKey(patientId) });
          setSaved(true);
          setText("");
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  };

  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          Quick Observation
        </h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter observation, medication given, patient complaint, or shift note..."
          rows={3}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm leading-relaxed resize-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-gray-800 placeholder:text-gray-400"
        />
        <Button
          onClick={handleSave}
          disabled={!text.trim() || createNote.isPending || saved}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
        >
          {saved ? (
            <><CheckCircle className="w-4 h-4 mr-2" /> Note Saved</>
          ) : createNote.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Observation</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main PatientDetail page ──────────────────────────────────────────────────
export default function PatientDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { role } = useRole();
  const isDoctor = role === "Doctor";

  const { data: patient, isLoading } = useGetPatient(Number(id), {
    query: { enabled: !!id, queryKey: getGetPatientQueryKey(Number(id)) },
  });
  const { data: notes } = useGetPatientNotes(Number(id), {
    query: { enabled: !!id, queryKey: getGetPatientNotesQueryKey(Number(id)) },
  });

  const [lang, setLang] = useState<"en" | "ta">("en");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [tamilExp, setTamilExp] = useState<string | null>(null);

  const explainRisk = useExplainRisk();
  const translateText = useTranslateText();

  // Doctors only: auto-fetch AI explanation for flagged patients
  useEffect(() => {
    if (
      isDoctor &&
      patient &&
      (patient.risk === "amber" || patient.risk === "red") &&
      !explanation &&
      !explainRisk.isPending
    ) {
      explainRisk.mutate(
        {
          data: {
            patientId: patient.id,
            vitalsHistory: patient.vitalsHistory,
            patientName: patient.name,
            diagnosis: patient.diagnosis,
          },
        },
        { onSuccess: (data) => setExplanation(data.explanation) }
      );
    }
  }, [patient, isDoctor]);

  const toggleLang = () => {
    if (lang === "en") {
      setLang("ta");
      if (explanation && !tamilExp) {
        translateText.mutate(
          { data: { text: explanation } },
          { onSuccess: (data) => setTamilExp(data.translated) }
        );
      }
    } else {
      setLang("en");
    }
  };

  if (isLoading || !patient) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading patient...</div>;
  }

  const isFlagged = patient.risk === "amber" || patient.risk === "red";

  return (
    <div className="space-y-6">
      {/* Back bar */}
      <div className="flex items-center gap-3">
        <Link
          href="/ward"
          className="p-2 -ml-2 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Back to Ward</div>
      </div>

      {/* Patient header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{patient.name}</h1>
            <RiskBadge risk={patient.risk} />
          </div>
          <p className="text-sm text-gray-500">
            {patient.age}y • Bed {patient.bedNumber} • {patient.ward}
          </p>
          <p className="text-sm font-medium text-gray-800 mt-2 bg-gray-50 inline-block px-3 py-1 rounded-md">
            {patient.diagnosis}
          </p>
        </div>

        {/* Role-specific CTA */}
        {isDoctor ? (
          <Link href={`/patients/${id}/notes/new`} className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto shadow-md gap-2">
              <Mic className="w-5 h-5" /> Dictate SOAP Note
            </Button>
          </Link>
        ) : (
          <div className="w-full md:w-auto">
            <NurseVitalsForm patientId={Number(id)} />
          </div>
        )}
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: chart + notes */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm bg-white border-gray-100">
            <CardContent className="p-5">
              <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 mb-6">
                <Activity className="w-5 h-5 text-primary" />
                Vitals Trend
              </h3>
              <VitalsChart data={patient.vitalsHistory} />
            </CardContent>
          </Card>

          {/* Nurse observation note form */}
          {!isDoctor && <NurseObservationForm patientId={Number(id)} />}

          {/* Notes history (visible to all) */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 px-1 text-gray-900">
              <FileText className="w-5 h-5 text-primary" />
              Clinical Notes
              <span className="ml-auto text-xs font-normal text-gray-400 normal-case tracking-normal">
                Visible to all ward staff
              </span>
            </h3>
            {!notes?.length ? (
              <div className="text-center p-8 bg-white border border-gray-100 rounded-xl text-gray-500 text-sm shadow-sm">
                No notes recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {[...(notes ?? [])].reverse().map((note) => {
                  const isNurseNote = note.role === "Nurse";
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className="shadow-sm bg-white border-gray-100">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-bold text-xs uppercase tracking-wide px-2.5 py-1 rounded-full",
                                  isNurseNote
                                    ? "bg-teal-50 text-teal-700"
                                    : "bg-blue-50 text-blue-700"
                                )}
                              >
                                {note.isSoap ? "SOAP" : "Observation"} · {note.role}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(note.createdAt), "MMM d, h:mm a")}
                            </span>
                          </div>

                          {note.isSoap ? (
                            <div className="space-y-3 text-sm leading-relaxed">
                              {note.soapSubjective && (
                                <div className="bg-blue-50/60 p-3 rounded-lg">
                                  <span className="font-bold text-blue-900 block mb-1 text-xs uppercase tracking-wide">Subjective</span>
                                  <span className="text-gray-700">{note.soapSubjective}</span>
                                </div>
                              )}
                              {note.soapObjective && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <span className="font-bold text-gray-900 block mb-1 text-xs uppercase tracking-wide">Objective</span>
                                  <span className="text-gray-700">{note.soapObjective}</span>
                                </div>
                              )}
                              {note.soapAssessment && (
                                <div className="bg-amber-50/60 p-3 rounded-lg">
                                  <span className="font-bold text-amber-900 block mb-1 text-xs uppercase tracking-wide">Assessment</span>
                                  <span className="text-gray-700">{note.soapAssessment}</span>
                                </div>
                              )}
                              {note.soapPlan && (
                                <div className="bg-green-50/60 p-3 rounded-lg">
                                  <span className="font-bold text-green-900 block mb-1 text-xs uppercase tracking-wide">Plan</span>
                                  <span className="text-gray-700">{note.soapPlan}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.rawText}</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Doctor: AI "Why Flagged?" card */}
          {isDoctor && isFlagged && (
            <Card
              className={cn(
                "shadow-md border-l-4 overflow-hidden",
                patient.risk === "red"
                  ? "border-l-red-500 bg-red-50/40"
                  : "border-l-amber-500 bg-amber-50/40"
              )}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                    <BrainCircuit
                      className={cn(
                        "w-5 h-5",
                        patient.risk === "red" ? "text-red-600" : "text-amber-600"
                      )}
                    />
                    Why Flagged?
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLang}
                    className="h-8 px-2 text-xs bg-white shadow-sm border-gray-200"
                    disabled={translateText.isPending}
                  >
                    <Languages className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    {lang === "en" ? "தமிழ்" : "English"}
                  </Button>
                </div>

                {explainRisk.isPending && !explanation ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-200/50 rounded w-full" />
                    <div className="h-4 bg-gray-200/50 rounded w-5/6" />
                    <div className="h-4 bg-gray-200/50 rounded w-4/6" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">
                    {lang === "ta" && tamilExp
                      ? tamilExp
                      : explanation || patient.riskReason}
                  </p>
                )}

                {lang === "ta" && translateText.isPending && (
                  <span className="text-xs font-medium text-gray-400 animate-pulse mt-3 block">
                    Translating to Tamil...
                  </span>
                )}
              </CardContent>
            </Card>
          )}

          {/* Nurse: simple alert reason (no AI) */}
          {!isDoctor && isFlagged && patient.riskReason && (
            <Card
              className={cn(
                "border-l-4",
                patient.risk === "red"
                  ? "border-l-red-500 bg-red-50/30"
                  : "border-l-amber-500 bg-amber-50/30"
              )}
            >
              <CardContent className="p-5">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-2 text-gray-800">
                  <AlertTriangle
                    className={cn(
                      "w-4 h-4",
                      patient.risk === "red" ? "text-red-600" : "text-amber-600"
                    )}
                  />
                  Alert Reason
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{patient.riskReason}</p>
                <p className="text-xs text-gray-400 mt-3">Notify the attending doctor if concerned.</p>
              </CardContent>
            </Card>
          )}

          {/* Current vitals snapshot */}
          <Card className="shadow-sm bg-white border-gray-100">
            <CardContent className="p-5">
              <h3 className="font-bold text-lg mb-5 text-gray-900">Current Vitals</h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Heart Rate",
                    value: `${patient.latestVitals.heartRate}`,
                    unit: "bpm",
                    warn: patient.latestVitals.heartRate > 100 || patient.latestVitals.heartRate < 60,
                  },
                  {
                    label: "SpO2",
                    value: `${patient.latestVitals.spo2}`,
                    unit: "%",
                    warn: patient.latestVitals.spo2 < 95,
                  },
                  {
                    label: "Blood Pressure",
                    value: `${patient.latestVitals.bpSystolic}/${patient.latestVitals.bpDiastolic}`,
                    unit: "mmHg",
                    warn: patient.latestVitals.bpSystolic > 160,
                  },
                  {
                    label: "Resp Rate",
                    value: `${patient.latestVitals.respiratoryRate}`,
                    unit: "/min",
                    warn: patient.latestVitals.respiratoryRate > 24,
                  },
                  {
                    label: "Temperature",
                    value: `${patient.latestVitals.temperature}`,
                    unit: "°C",
                    warn: Number(patient.latestVitals.temperature) > 38.5,
                  },
                ].map(({ label, value, unit, warn }) => (
                  <div key={label} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <span className="text-gray-500 text-sm font-medium">{label}</span>
                    <span className={cn("font-bold text-lg", warn ? "text-red-600" : "text-gray-900")}>
                      {value}{" "}
                      <span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Nurse: last recorded time */}
              {!isDoctor && (
                <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50 text-right">
                  Last recorded: {format(new Date(patient.latestVitals.recordedAt), "h:mm a")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Doctor: note about nurse access */}
          {isDoctor && (
            <div className="text-xs text-gray-400 leading-relaxed px-1">
              All notes and vitals are visible to all ward staff. Nurse observations appear in the notes feed below.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
