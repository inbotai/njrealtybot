export type RenovationType = {
  id: string;
  label: string;
  avgMultiplier: number;
  minMultiplier: number;
  maxMultiplier: number;
  minBudget: number;
  maxBudget: number;
};

export const renovationTypes: RenovationType[] = [
  { id: "garage_door", label: "Garage Door Replacement", avgMultiplier: 0.93, minMultiplier: 0.85, maxMultiplier: 1.0, minBudget: 3500, maxBudget: 6000 },
  { id: "hardwood", label: "Hardwood Floor Refinish", avgMultiplier: 0.83, minMultiplier: 0.75, maxMultiplier: 0.90, minBudget: 2500, maxBudget: 7000 },
  { id: "roof", label: "Roof Replacement", avgMultiplier: 0.83, minMultiplier: 0.75, maxMultiplier: 0.90, minBudget: 10000, maxBudget: 25000 },
  { id: "hvac", label: "HVAC Replacement", avgMultiplier: 0.83, minMultiplier: 0.75, maxMultiplier: 0.90, minBudget: 7000, maxBudget: 16000 },
  { id: "kitchen_minor", label: "Minor Kitchen Remodel", avgMultiplier: 0.78, minMultiplier: 0.70, maxMultiplier: 0.85, minBudget: 22000, maxBudget: 40000 },
  { id: "landscaping", label: "Landscaping / Curb Appeal", avgMultiplier: 0.78, minMultiplier: 0.70, maxMultiplier: 0.85, minBudget: 3000, maxBudget: 12000 },
  { id: "bathroom", label: "Bathroom Renovation", avgMultiplier: 0.73, minMultiplier: 0.65, maxMultiplier: 0.80, minBudget: 20000, maxBudget: 40000 },
  { id: "exterior_paint", label: "Exterior Paint / Siding", avgMultiplier: 0.73, minMultiplier: 0.65, maxMultiplier: 0.80, minBudget: 10000, maxBudget: 22000 },
  { id: "windows", label: "Window Replacement", avgMultiplier: 0.68, minMultiplier: 0.60, maxMultiplier: 0.75, minBudget: 12000, maxBudget: 28000 },
  { id: "bathroom_add", label: "Bathroom Addition", avgMultiplier: 0.63, minMultiplier: 0.55, maxMultiplier: 0.70, minBudget: 45000, maxBudget: 80000 },
  { id: "kitchen_major", label: "Major Kitchen Remodel", avgMultiplier: 0.58, minMultiplier: 0.50, maxMultiplier: 0.65, minBudget: 65000, maxBudget: 130000 },
  { id: "master_suite", label: "Master Suite Addition", avgMultiplier: 0.48, minMultiplier: 0.40, maxMultiplier: 0.55, minBudget: 100000, maxBudget: 200000 },
];

export type CalcResult = {
  valueAdded: number;
  roiPercent: number;
  rangeMin: number;
  rangeMax: number;
  verdict: "green" | "yellow" | "red";
  verdictLabel: string;
  njAvgRoi: number;
  budgetWarning: string | null;
};

export function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/**
 * Dollars spent inside the typical budget recover at the catalog rate.
 * Spend above the typical maximum recovers much less: the next 50% of the
 * typical budget at 35% of the catalog rate, and anything past that at 10%.
 */
export function recoveredValue(budget: number, multiplier: number, reno: RenovationType): number {
  if (budget <= reno.maxBudget) return budget * multiplier;
  const typicalValue = reno.maxBudget * multiplier;
  const excess = budget - reno.maxBudget;
  const stretchCap = reno.maxBudget * 0.5;
  const stretch = Math.min(excess, stretchCap);
  const far = Math.max(0, excess - stretchCap);
  return typicalValue + stretch * multiplier * 0.35 + far * multiplier * 0.1;
}

export function calcRoi(budget: number, reno: RenovationType): CalcResult {
  let budgetWarning: string | null = null;
  if (budget < reno.minBudget) {
    budgetWarning = `A typical ${reno.label.toLowerCase()} costs ${fmtMoney(reno.minBudget)}–${fmtMoney(reno.maxBudget)}. Your budget of ${fmtMoney(budget)} is below the minimum — consider a less expensive renovation type.`;
  } else if (budget > reno.maxBudget * 1.5) {
    budgetWarning = `A typical ${reno.label.toLowerCase()} costs ${fmtMoney(reno.minBudget)}–${fmtMoney(reno.maxBudget)}. Your budget of ${fmtMoney(budget)} is well above average — extra spending adds little resale value.`;
  } else if (budget > reno.maxBudget) {
    budgetWarning = `A typical ${reno.label.toLowerCase()} costs ${fmtMoney(reno.minBudget)}–${fmtMoney(reno.maxBudget)}. Spending above that range recovers less of each extra dollar.`;
  }

  const valueAdded = recoveredValue(budget, reno.avgMultiplier, reno);
  const recoveryPercent = (valueAdded / budget) * 100;
  const roiPercent = ((valueAdded - budget) / budget) * 100;
  const rangeMin = recoveredValue(budget, reno.minMultiplier, reno);
  const rangeMax = recoveredValue(budget, reno.maxMultiplier, reno);

  let verdict: CalcResult["verdict"];
  let verdictLabel: string;
  if (budget < reno.minBudget) {
    verdict = "red";
    verdictLabel = "Budget too low for this renovation type";
  } else if (recoveryPercent >= 80) {
    verdict = "green";
    verdictLabel = "Strong recovery — recommended upgrade";
  } else if (recoveryPercent >= 60) {
    verdict = "yellow";
    verdictLabel = budget > reno.maxBudget
      ? "Moderate recovery — extra budget above the typical range comes back slowly"
      : "Moderate recovery — do it if you'll enjoy it";
  } else {
    verdict = "red";
    verdictLabel = budget > reno.maxBudget
      ? "Low recovery — most of the over-budget spend will not come back at sale"
      : "Low recovery — only if you need the space";
  }

  return {
    valueAdded,
    roiPercent,
    rangeMin,
    rangeMax,
    verdict,
    verdictLabel,
    njAvgRoi: recoveryPercent,
    budgetWarning,
  };
}
