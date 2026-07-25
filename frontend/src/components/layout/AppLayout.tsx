import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Users, Bell, LogOut, Stethoscope, HeartPulse } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { role, setRole } = useRole();

  if (!role) {
    return <>{children}</>;
  }

  const isDoctor = role === "Doctor";
  const displayName = isDoctor ? "Dr. On Call" : "Ward Nurse";
  const RoleIcon = isDoctor ? Stethoscope : HeartPulse;

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-sm sticky top-0 z-20">
        <div className="w-full px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-white tracking-tighter">
              WC
            </div>
            <span className="font-semibold tracking-tight text-lg">Ward Copilot</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <div className="hidden sm:flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
              <RoleIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{displayName}</span>
            </div>
            <button
              onClick={() => setRole(null)}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              title="Switch role"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 mx-auto w-full">
        <nav className="hidden md:flex w-64 flex-col py-6 px-4 gap-2 border-r border-gray-200 bg-white min-h-[calc(100vh-3.5rem)] sticky top-14">
          <div className="px-4 pb-4 mb-2 border-b border-gray-100">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
              isDoctor ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"
            )}>
              <RoleIcon className="w-3 h-3" />
              {role}
            </div>
          </div>
          <Link
            href="/ward"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
              location === "/ward" ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Users className="w-5 h-5" />
            Ward Dashboard
          </Link>
          <Link
            href="/alerts"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
              location === "/alerts" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Bell className="w-5 h-5" />
            Live Alerts
          </Link>

          {/* Role-specific hint */}
          <div className="mt-auto px-4 py-3 bg-gray-50 rounded-lg text-xs text-gray-500 leading-relaxed">
            {isDoctor
              ? "Open a patient to dictate a SOAP note or get AI risk analysis."
              : "Open a patient to log vitals or add an observation note."}
          </div>
        </nav>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 w-full max-w-full overflow-hidden">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/ward"
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              location === "/ward" ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">Ward</span>
          </Link>
          <Link
            href="/alerts"
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              location === "/alerts" ? "text-red-500" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Bell className="w-6 h-6" />
            <span className="text-[10px] font-medium">Alerts</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
