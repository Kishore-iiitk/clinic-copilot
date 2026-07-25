import { cn } from "@/lib/utils";

type RiskLevel = "green" | "amber" | "red";

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  const map = {
    green: "bg-[#10b981]/15 text-[#047857] border-[#10b981]/30",
    amber: "bg-[#f59e0b]/15 text-[#b45309] border-[#f59e0b]/30",
    red: "bg-[#ef4444]/15 text-[#b91c1c] border-[#ef4444]/30 animate-pulse",
  };

  const label = {
    green: "Stable",
    amber: "Monitor",
    red: "Critical"
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm", map[risk], className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-[#10b981]": risk === "green",
        "bg-[#f59e0b]": risk === "amber",
        "bg-[#ef4444]": risk === "red"
      })} />
      {label[risk]}
    </span>
  );
}
