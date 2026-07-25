import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Vitals } from '@/lib/api-client';

export function VitalsChart({ data }: { data: Vitals[] }) {
  const chartData = data.map(v => ({
    time: new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    HR: v.heartRate,
    SpO2: v.spo2,
    BP: v.bpSystolic
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontSize: '14px', fontWeight: 500 }}
          />
          <Line type="monotone" dataKey="HR" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="SpO2" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="BP" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
