export type RiskBadge = "green" | "amber" | "red";

interface VitalsReading {
  heartRate: number;
  spo2: number;
  bpSystolic: number;
  bpDiastolic: number;
}

function avg(vals: number[]): number {
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function computeRisk(
  history: VitalsReading[],
  riskReason?: { reason: string } | null,
): { risk: RiskBadge; riskReason: string | null } {
  if (history.length < 3) {
    return { risk: "green", riskReason: null };
  }

  // Baseline = average of first half of readings
  const baselineCount = Math.max(2, Math.floor(history.length / 2));
  const baseline = history.slice(0, baselineCount);
  const recent = history.slice(-3); // last 3 readings

  const baseHR = avg(baseline.map((v) => v.heartRate));
  const baseSpo2 = avg(baseline.map((v) => v.spo2));
  const baseBP = avg(baseline.map((v) => v.bpSystolic));

  const recentHR = avg(recent.map((v) => v.heartRate));
  const recentSpo2 = avg(recent.map((v) => v.spo2));
  const recentBP = avg(recent.map((v) => v.bpSystolic));

  const hrChange = Math.abs((recentHR - baseHR) / baseHR) * 100;
  const spo2Drop = baseSpo2 - recentSpo2;
  const bpChange = Math.abs(recentBP - baseBP);

  const flags: string[] = [];
  let adverseCount = 0;

  // HR flags
  if (hrChange >= 15) {
    flags.push(`HR up ${hrChange.toFixed(0)}% from baseline (${Math.round(baseHR)}→${Math.round(recentHR)} bpm)`);
    adverseCount++;
  } else if (hrChange >= 10) {
    flags.push(`HR trending up ${hrChange.toFixed(0)}% (${Math.round(baseHR)}→${Math.round(recentHR)} bpm)`);
    adverseCount += 0.5;
  }

  // SpO2 flags
  if (spo2Drop >= 5) {
    flags.push(`SpO₂ dropped ${spo2Drop.toFixed(0)}% (${Math.round(baseSpo2)}→${Math.round(recentSpo2)}%)`);
    adverseCount++;
  } else if (spo2Drop >= 3) {
    flags.push(`SpO₂ down ${spo2Drop.toFixed(0)}% (${Math.round(baseSpo2)}→${Math.round(recentSpo2)}%)`);
    adverseCount += 0.5;
  }

  // BP flags
  if (bpChange >= 25) {
    flags.push(`BP shifted ${bpChange.toFixed(0)} mmHg (${Math.round(baseBP)}→${Math.round(recentBP)} mmHg sys)`);
    adverseCount++;
  } else if (bpChange >= 15) {
    flags.push(`BP trending (${Math.round(baseBP)}→${Math.round(recentBP)} mmHg sys)`);
    adverseCount += 0.5;
  }

  let risk: RiskBadge = "green";
  if (adverseCount >= 1.5) {
    risk = "red";
  } else if (adverseCount >= 0.5) {
    risk = "amber";
  }

  const riskReasonStr = flags.length > 0 ? flags.join("; ") : null;
  return { risk, riskReason: riskReasonStr };
}
