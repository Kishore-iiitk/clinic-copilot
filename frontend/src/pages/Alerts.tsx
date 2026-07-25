import { useGetAlerts, getGetAlertsQueryKey } from "@/lib/api-client";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { RiskBadge } from "@/components/patient/RiskBadge";
import { Activity, Thermometer, Wind, Droplet, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Alerts() {
  const { data: alerts, isLoading } = useGetAlerts({ query: { queryKey: getGetAlertsQueryKey() } });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="text-red-600 w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Active Alerts</h1>
          <p className="text-xs text-gray-500">Patients requiring immediate attention</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Card key={i} className="h-32 animate-pulse bg-white border-transparent" />)}
        </div>
      ) : alerts?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">All Clear</h3>
          <p className="text-gray-500 text-sm mt-2">No active alerts right now. Rest easy.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {alerts?.map((patient) => (
              <motion.div
                key={patient.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/patients/${patient.id}`}>
                  <Card className={cn(
                    "cursor-pointer border-l-4 transition-all duration-300 shadow-sm hover:shadow-md bg-white",
                    patient.risk === 'red' ? 'border-l-[#ef4444]' : '#f59e0b'
                  )}>
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <RiskBadge risk={patient.risk} />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bed {patient.bedNumber}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{patient.riskReason || patient.diagnosis}</p>
                      </div>
                      
                      <div className="flex gap-4 sm:gap-6 bg-gray-50/80 p-3 rounded-lg w-full sm:w-auto justify-between sm:justify-start shrink-0">
                        <div className="text-center">
                          <div className="text-[10px] font-bold uppercase text-gray-500 mb-1 flex justify-center"><Activity className="w-3 h-3" /></div>
                          <div className="font-bold text-sm text-red-600">{patient.latestVitals.heartRate}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] font-bold uppercase text-gray-500 mb-1 flex justify-center"><Wind className="w-3 h-3" /></div>
                          <div className="font-bold text-sm text-amber-600">{patient.latestVitals.spo2}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] font-bold uppercase text-gray-500 mb-1 flex justify-center"><Droplet className="w-3 h-3" /></div>
                          <div className="font-bold text-sm text-gray-900">{patient.latestVitals.bpSystolic}/{patient.latestVitals.bpDiastolic}</div>
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
