import { useState } from "react";
import {
  useListPatients,
  useSimulateShift,
  useCreatePatient,
  getListPatientsQueryKey,
} from "@/lib/api-client";
import { getGetAlertsQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiskBadge } from "@/components/patient/RiskBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import {
  Activity,
  Thermometer,
  Wind,
  Droplet,
  Clock,
  UserPlus,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRole } from "@/context/RoleContext";

// ─── Nurse: Add Patient dialog ───────────────────────────────────────────────
function AddPatientDialog() {
  const queryClient = useQueryClient();
  const createPatient = useCreatePatient();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    bedNumber: "",
    age: "",
    ward: "",
    diagnosis: "",
    heartRate: "",
    spo2: "",
    bpSystolic: "",
    bpDiastolic: "",
    temperature: "",
    respiratoryRate: "",
  });

  const resetForm = () =>
    setForm({
      name: "",
      bedNumber: "",
      age: "",
      ward: "",
      diagnosis: "",
      heartRate: "",
      spo2: "",
      bpSystolic: "",
      bpDiastolic: "",
      temperature: "",
      respiratoryRate: "",
    });

  const handleSubmit = () => {
    setError(null);

    if (
      !form.name.trim() ||
      !form.bedNumber.trim() ||
      !form.ward.trim() ||
      !form.diagnosis.trim()
    ) {
      setError("Please fill in name, bed number, ward, and diagnosis.");
      return;
    }

    const data = {
      name: form.name.trim(),
      bedNumber: form.bedNumber.trim(),
      age: parseInt(form.age),
      ward: form.ward.trim(),
      diagnosis: form.diagnosis.trim(),
      heartRate: parseInt(form.heartRate),
      spo2: parseInt(form.spo2),
      bpSystolic: parseInt(form.bpSystolic),
      bpDiastolic: parseInt(form.bpDiastolic),
      temperature: parseFloat(form.temperature),
      respiratoryRate: parseInt(form.respiratoryRate),
    };

    if (Object.values(data).some((v) => typeof v === "number" && isNaN(v))) {
      setError("Please fill in age and all vitals with valid numbers.");
      return;
    }

    createPatient.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListPatientsQueryKey(),
          });
          queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
          setSaved(true);
          resetForm();
          setTimeout(() => {
            setSaved(false);
            setOpen(false);
          }, 1200);
        },
        onError: () => {
          setError("Could not add patient. Please try again.");
        },
      },
    );
  };

  const fields = [
    { key: "heartRate", label: "Heart Rate", unit: "bpm", type: "integer" },
    { key: "spo2", label: "SpO2", unit: "%", type: "integer" },
    { key: "bpSystolic", label: "BP Systolic", unit: "mmHg", type: "integer" },
    {
      key: "bpDiastolic",
      label: "BP Diastolic",
      unit: "mmHg",
      type: "integer",
    },
    { key: "temperature", label: "Temperature", unit: "°C", type: "decimal" },
    {
      key: "respiratoryRate",
      label: "Resp Rate",
      unit: "/min",
      type: "integer",
    },
  ] as const;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          resetForm();
        }
      }}
    >
      <Button
        onClick={() => setOpen(true)}
        className="shadow-md gap-2 bg-teal-600 hover:bg-teal-700 text-white"
      >
        <UserPlus className="w-4 h-4" /> Add Patient
      </Button>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Patient name"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Bed Number
              </label>
              <input
                type="text"
                value={form.bedNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bedNumber: e.target.value }))
                }
                placeholder="e.g. B-12"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Age
              </label>
              <input
                type="number"
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
                placeholder="Age"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Ward
              </label>
              <input
                type="text"
                value={form.ward}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ward: e.target.value }))
                }
                placeholder="e.g. ICU"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Diagnosis
              </label>
              <input
                type="text"
                value={form.diagnosis}
                onChange={(e) =>
                  setForm((f) => ({ ...f, diagnosis: e.target.value }))
                }
                placeholder="Primary diagnosis"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Initial Vitals
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {fields.map(({ key, label, unit, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={type === "decimal" ? "0.1" : "1"}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
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
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createPatient.isPending || saved}
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" /> Added
              </>
            ) : createPatient.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" /> Add Patient
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WardDashboard() {
  const queryClient = useQueryClient();
  const { role } = useRole();
  const isNurse = role === "Nurse";
  const { data: patients, isLoading } = useListPatients({
    query: { queryKey: getListPatientsQueryKey() },
  });
  const simulateMutation = useSimulateShift();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    let steps = 0;

    const runStep = () => {
      if (steps >= 40) {
        setIsSimulating(false);
        return;
      }

      simulateMutation.mutate(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListPatientsQueryKey(),
          });
          queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
          steps++;
          setTimeout(runStep, 1500);
        },
        onError: () => {
          setIsSimulating(false);
        },
      });
    };

    runStep();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Ward Overview
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Live patient monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isNurse && <AddPatientDialog />}
          <Button
            onClick={handleSimulate}
            disabled={isSimulating}
            className={cn(
              "transition-all duration-300 shadow-md",
              isSimulating && "bg-amber-500 hover:bg-amber-600 text-white",
            )}
          >
            {isSimulating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" /> Simulating...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" /> Simulate Shift
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="h-48 animate-pulse bg-white border-transparent"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {patients?.map((patient) => (
              <motion.div
                key={patient.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/patients/${patient.id}`}>
                  <Card
                    className={cn(
                      "cursor-pointer border-l-4 transition-all duration-300 overflow-hidden relative shadow-sm hover:shadow-md bg-white",
                      patient.risk === "red"
                        ? "border-l-[#ef4444]"
                        : patient.risk === "amber"
                          ? "border-l-[#f59e0b]"
                          : "border-l-[#10b981]",
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">
                            Bed {patient.bedNumber} • {patient.ward}
                          </div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {patient.name}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {patient.age}y • {patient.diagnosis}
                          </div>
                        </div>
                        <RiskBadge risk={patient.risk} />
                      </div>

                      <div className="grid grid-cols-4 gap-2 mt-4 bg-gray-50/80 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1 flex justify-center uppercase font-semibold">
                            <Activity className="w-3 h-3" />
                          </div>
                          <div
                            className={cn(
                              "font-bold text-sm",
                              patient.latestVitals.heartRate > 100 ||
                                patient.latestVitals.heartRate < 60
                                ? "text-red-600"
                                : "text-gray-900",
                            )}
                          >
                            {patient.latestVitals.heartRate}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1 flex justify-center uppercase font-semibold">
                            <Wind className="w-3 h-3" />
                          </div>
                          <div
                            className={cn(
                              "font-bold text-sm",
                              patient.latestVitals.spo2 < 95
                                ? "text-amber-600"
                                : "text-gray-900",
                            )}
                          >
                            {patient.latestVitals.spo2}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1 flex justify-center uppercase font-semibold">
                            <Droplet className="w-3 h-3" />
                          </div>
                          <div className="font-bold text-sm text-gray-900">
                            {patient.latestVitals.bpSystolic}/
                            {patient.latestVitals.bpDiastolic}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1 flex justify-center uppercase font-semibold">
                            <Thermometer className="w-3 h-3" />
                          </div>
                          <div className="font-bold text-sm text-gray-900">
                            {patient.latestVitals.temperature}°
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
