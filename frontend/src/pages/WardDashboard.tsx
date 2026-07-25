import { useState } from "react";
import { useListPatients, useSimulateShift, getListPatientsQueryKey } from "@/lib/api-client";
import { getGetAlertsQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiskBadge } from "@/components/patient/RiskBadge";
import { Link } from "wouter";
import { Activity, Thermometer, Wind, Droplet, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function WardDashboard() {
  const queryClient = useQueryClient();
  const { data: patients, isLoading } = useListPatients({ query: { queryKey: getListPatientsQueryKey() } });
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
          queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
          steps++;
          setTimeout(runStep, 1500);
        },
        onError: () => {
          setIsSimulating(false);
        }
      });
    };
    
    runStep();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Ward Overview</h1>
          <p className="text-xs md:text-sm text-gray-500">Live patient monitoring</p>
        </div>
        <Button 
          onClick={handleSimulate} 
          disabled={isSimulating}
          className={cn("transition-all duration-300 shadow-md", isSimulating && "bg-amber-500 hover:bg-amber-600 text-white")}
        >
          {isSimulating ? <><Clock className="w-4 h-4 mr-2 animate-spin" /> Simulating...</> : <><Activity className="w-4 h-4 mr-2" /> Simulate Shift</>}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="h-48 animate-pulse bg-white border-transparent" />
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
                  <Card className={cn(
                    "cursor-pointer border-l-4 transition-all duration-300 overflow-hidden relative shadow-sm hover:shadow-md bg-white",
                    patient.risk === 'red' ? 'border-l-[#ef4444]' : patient.risk === 'amber' ? 'border-l-[#f59e0b]' : 'border-l-[#10b981]'
                  )}>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Bed {patient.bedNumber} • {patient.ward}</div>
                          <h3 className="font-bold text-lg text-gray-900">{patient.name}</h3>
                          <div className="text-sm text-gray-500">{patient.age}y • {patient.diagnosis}</div>
                        </div>
                        <RiskBadge risk={patient.risk} />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mt-4 bg-gray-50/80 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1 flex justify-center uppercase font-semibold"><Activity className="w-3 h-3" /></div>
                          <div className={cn("font-bold text-sm", patient.latestVitals.heartRate > 100 || patient.latestVitals.heartRate < 60 ? "text-red-600" : "text-gray-900")}>{patient.latestVitals.heartRate}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1 flex justify-center uppercase font-semibold"><Wind className="w-3 h-3" /></div>
                          <div className={cn("font-bold text-sm", patient.latestVitals.spo2 < 95 ? "text-amber-600" : "text-gray-900")}>{patient.latestVitals.spo2}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1 flex justify-center uppercase font-semibold"><Droplet className="w-3 h-3" /></div>
                          <div className="font-bold text-sm text-gray-900">{patient.latestVitals.bpSystolic}/{patient.latestVitals.bpDiastolic}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1 flex justify-center uppercase font-semibold"><Thermometer className="w-3 h-3" /></div>
                          <div className="font-bold text-sm text-gray-900">{patient.latestVitals.temperature}°</div>
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
