import { useLocation } from "wouter";
import { useRole } from "@/context/RoleContext";
import { Stethoscope, HeartPulse, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ROLES = [
  {
    id: "Doctor" as const,
    title: "Doctor on Call",
    icon: Stethoscope,
    color: "blue",
    features: [
      "AI risk explanations (Why Flagged?)",
      "Voice dictation → SOAP notes",
      "English / Tamil toggle",
      "Full clinical note history",
    ],
  },
  {
    id: "Nurse" as const,
    title: "Ward Nurse",
    icon: HeartPulse,
    color: "teal",
    features: [
      "Log vitals readings instantly",
      "Quick observation notes",
      "Live alert feed",
      "View all clinical notes",
    ],
  },
];

export default function RoleSelect() {
  const { setRole } = useRole();
  const [, navigate] = useLocation();

  const handleSelect = (role: "Doctor" | "Nurse") => {
    setRole(role);
    navigate("/ward");
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Ward Copilot</h1>
        <p className="text-gray-500 mt-2 font-medium">AI Clinical Assistant · Night Shift</p>
      </motion.div>

      <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLES.map((r, i) => {
          const Icon = r.icon;
          const isBlue = r.color === "blue";
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              onClick={() => handleSelect(r.id)}
              className={`group text-left p-6 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-200 bg-white
                ${isBlue ? "border-blue-100 hover:border-blue-400" : "border-teal-100 hover:border-teal-400"}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${isBlue ? "bg-blue-50 group-hover:bg-blue-100" : "bg-teal-50 group-hover:bg-teal-100"}`}
              >
                <Icon className={`w-6 h-6 ${isBlue ? "text-blue-600" : "text-teal-600"}`} />
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-3">{r.title}</h2>

              <ul className="space-y-2">
                {r.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                      ${isBlue ? "bg-blue-500" : "bg-teal-500"}`}>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-8 font-medium">Demo mode · No authentication required</p>
    </div>
  );
}
