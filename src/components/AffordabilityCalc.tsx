"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LeadGate from "@/components/LeadGate";

export default function AffordabilityCalc() {
  const router = useRouter();
  const [income, setIncome] = useState("");
  const [debts, setDebts] = useState("");
  const [down, setDown] = useState("20");
  const [rate, setRate] = useState("6.875");
  const [result, setResult] = useState<{ budget: number; monthly: number } | null>(null);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    const annualIncome = Number(income.replace(/[^0-9]/g, ""));
    const monthlyDebt = Number(debts.replace(/[^0-9]/g, "")) || 0;
    if (!annualIncome) return;

    const monthlyIncome = annualIncome / 12;
    // 28% front-end ratio (housing) or 36% back-end (total debt)
    const maxHousing = Math.min(monthlyIncome * 0.28, monthlyIncome * 0.36 - monthlyDebt);
    // Subtract estimated taxes (~1.89% NJ avg) + insurance (~0.4%)
    const r = Number(rate) / 100 / 12;
    const n = 360; // 30 years
    const piRatio = r === 0 ? 1 / n : (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    // maxHousing = PI + taxes + insurance → PI = maxHousing * 0.7 (rough)
    const maxPI = maxHousing * 0.70;
    const loanAmount = maxPI / piRatio;
    const downPct = Number(down) / 100;
    const budget = Math.round(loanAmount / (1 - downPct));
    setResult({ budget, monthly: Math.round(maxHousing) });
  }

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            How Much House Can I{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">Afford?</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">Enter your income and debts — we&apos;ll show you your budget and matching NJ homes.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-lg px-4">
          {!result ? (
            <form onSubmit={calculate} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
              <div>
                <label className="text-sm font-medium text-gray-700">Annual Household Income</label>
                <input type="text" value={income} onChange={e => setIncome(e.target.value)}
                  placeholder="$100,000" required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Monthly Debts (car, student loans, credit cards)</label>
                <input type="text" value={debts} onChange={e => setDebts(e.target.value)}
                  placeholder="$500"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Down Payment %</label>
                  <select value={down} onChange={e => setDown(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold">
                    {[5, 10, 15, 20, 25].map(n => <option key={n} value={String(n)}>{n}%</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Interest Rate %</label>
                  <input type="number" value={rate} onChange={e => setRate(e.target.value)}
                    step="0.125" min="1" max="15"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400">
                Calculate My Budget
              </button>
              <p className="text-xs text-gray-400 text-center">Based on 28/36 DTI ratio. NJ avg property tax ~1.89%.</p>
            </form>
          ) : (
            <div className="text-center">
              <div className="rounded-xl bg-gradient-to-b from-navy to-indigo-900 p-8 text-white shadow-xl">
                <p className="text-sm text-gray-300">You can afford up to</p>
                <p className="mt-2 text-5xl font-extrabold text-gold">${result.budget.toLocaleString()}</p>
                <p className="mt-2 text-sm text-gray-300">
                  Est. monthly payment: ${result.monthly.toLocaleString()}/mo
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  With {down}% down (${Math.round(result.budget * Number(down) / 100).toLocaleString()}) at {rate}%
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button onClick={() => router.push(`/search?maxPrice=${result.budget}`)}
                  className="rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-indigo-900">
                  See Homes in My Budget
                </button>
                <button onClick={() => router.push(`/chat?q=I can afford up to $${result.budget.toLocaleString()}, help me find a home`)}
                  className="rounded-lg border border-navy px-6 py-3 font-semibold text-navy hover:bg-gray-50">
                  Ask Vale for Help
                </button>
              </div>
              <button onClick={() => setResult(null)} className="mt-4 text-sm text-gray-400 hover:text-navy">Recalculate</button>

              <div className="mt-8">
                <LeadGate
                  inline={true}
                  valueProp="Get Matched Homes in My Budget"
                  source="affordability_calc"
                  message={`Budget: $${result.budget.toLocaleString()} | Monthly: $${result.monthly.toLocaleString()}/mo | ${down}% down at ${rate}%`}
                  resultsText={`💰 *Your Home Budget*\n\nMax Budget: $${result.budget.toLocaleString()}\nMonthly Payment: $${result.monthly.toLocaleString()}/mo\nDown Payment: $${Math.round(result.budget * Number(down) / 100).toLocaleString()} (${down}%)\n\nSee homes in your budget: gardenstate.ai/search\n— Garden State AI`}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
