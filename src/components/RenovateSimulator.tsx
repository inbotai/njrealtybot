"use client";

import { useState } from "react";

const WA_LINK = "https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20see%20renovation%20options%20for%20my%20home";

const roomTypes = [
  { id: "kitchen", label: "Kitchen", icon: "🍳", avgCost: "$15,000 – $40,000", avgRoi: "2.5x – 3.5x" },
  { id: "bathroom", label: "Bathroom", icon: "🛁", avgCost: "$8,000 – $25,000", avgRoi: "2x – 3x" },
  { id: "livingroom", label: "Living Room", icon: "🛋️", avgCost: "$5,000 – $15,000", avgRoi: "1.5x – 2x" },
  { id: "exterior", label: "Exterior / Curb Appeal", icon: "🏡", avgCost: "$3,000 – $10,000", avgRoi: "2x – 4x" },
  { id: "landscaping", label: "Landscaping", icon: "🌳", avgCost: "$2,000 – $8,000", avgRoi: "1.5x – 2.5x" },
];

const roiData = [
  { renovation: "Minor Kitchen Remodel", cost: "$15,000", valueAdded: "$45,000", roi: "200%", tier: "high" },
  { renovation: "Bathroom Addition", cost: "$25,000", valueAdded: "$50,000", roi: "100%", tier: "high" },
  { renovation: "New Garage Door", cost: "$4,000", valueAdded: "$16,000", roi: "300%", tier: "high" },
  { renovation: "Exterior Paint / Siding", cost: "$8,000", valueAdded: "$20,000", roi: "150%", tier: "high" },
  { renovation: "Hardwood Floor Refinish", cost: "$3,000", valueAdded: "$10,000", roi: "233%", tier: "medium" },
  { renovation: "Landscaping / Curb Appeal", cost: "$5,000", valueAdded: "$12,000", roi: "140%", tier: "medium" },
  { renovation: "Major Kitchen Remodel", cost: "$60,000", valueAdded: "$72,000", roi: "20%", tier: "low" },
  { renovation: "Master Suite Addition", cost: "$100,000", valueAdded: "$80,000", roi: "-20%", tier: "low" },
];

type RenovationType = {
  id: string;
  label: string;
  avgMultiplier: number;
  minMultiplier: number;
  maxMultiplier: number;
};

const renovationTypes: RenovationType[] = [
  { id: "kitchen_minor", label: "Minor Kitchen Remodel", avgMultiplier: 2.5, minMultiplier: 1.8, maxMultiplier: 3.0 },
  { id: "kitchen_major", label: "Major Kitchen Remodel", avgMultiplier: 1.0, minMultiplier: 0.8, maxMultiplier: 1.2 },
  { id: "bathroom", label: "Bathroom Remodel", avgMultiplier: 2.0, minMultiplier: 1.5, maxMultiplier: 2.5 },
  { id: "bathroom_add", label: "Bathroom Addition", avgMultiplier: 1.6, minMultiplier: 1.3, maxMultiplier: 2.0 },
  { id: "garage_door", label: "Garage Door Replacement", avgMultiplier: 3.8, minMultiplier: 3.0, maxMultiplier: 4.5 },
  { id: "exterior_paint", label: "Exterior Paint / Siding", avgMultiplier: 2.0, minMultiplier: 1.5, maxMultiplier: 2.5 },
  { id: "hardwood", label: "Hardwood Floor Refinish", avgMultiplier: 3.0, minMultiplier: 2.5, maxMultiplier: 3.5 },
  { id: "landscaping", label: "Landscaping", avgMultiplier: 2.0, minMultiplier: 1.5, maxMultiplier: 2.5 },
  { id: "roof", label: "Roof Replacement", avgMultiplier: 0.8, minMultiplier: 0.6, maxMultiplier: 1.0 },
  { id: "windows", label: "Window Replacement", avgMultiplier: 0.85, minMultiplier: 0.7, maxMultiplier: 1.0 },
  { id: "basement", label: "Basement Finish", avgMultiplier: 0.65, minMultiplier: 0.5, maxMultiplier: 0.8 },
];

type CalcResult = {
  valueAdded: number;
  roiPercent: number;
  rangeMin: number;
  rangeMax: number;
  verdict: "green" | "yellow" | "red";
  verdictLabel: string;
  njAvgRoi: number;
};

function calcRoi(budget: number, reno: RenovationType): CalcResult {
  const valueAdded = budget * reno.avgMultiplier;
  const roiPercent = ((valueAdded - budget) / budget) * 100;
  const rangeMin = budget * reno.minMultiplier;
  const rangeMax = budget * reno.maxMultiplier;
  const njAvgRoi = (reno.avgMultiplier - 1) * 100;

  let verdict: CalcResult["verdict"];
  let verdictLabel: string;
  if (roiPercent >= 100) {
    verdict = "green";
    verdictLabel = "Excellent investment — do it!";
  } else if (roiPercent >= 0) {
    verdict = "yellow";
    verdictLabel = "Breaks even — proceed with caution";
  } else {
    verdict = "red";
    verdictLabel = "Likely loses value — consider alternatives";
  }

  return { valueAdded, roiPercent, rangeMin, rangeMax, verdict, verdictLabel, njAvgRoi };
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const verdictColors = { green: "bg-green-100 border-green-500 text-green-800", yellow: "bg-yellow-100 border-yellow-500 text-yellow-800", red: "bg-red-100 border-red-500 text-red-800" };
const verdictDots = { green: "bg-green-500", yellow: "bg-yellow-500", red: "bg-red-500" };

export default function RenovateSimulator() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [renoId, setRenoId] = useState(renovationTypes[0].id);
  const [budgetStr, setBudgetStr] = useState("");
  const [result, setResult] = useState<CalcResult | null>(null);

  function handleCalc() {
    const budget = parseInt(budgetStr.replace(/\D/g, ""), 10);
    if (!budget || budget <= 0) return;
    const reno = renovationTypes.find((r) => r.id === renoId)!;
    setResult(calcRoi(budget, reno));
  }

  const selectedReno = renovationTypes.find((r) => r.id === renoId)!;

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            Renovation{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              ROI Calculator
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            See how renovations would look and calculate the ROI — before spending a dollar.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">How It Works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">1</div>
              <h3 className="mt-3 font-semibold text-navy">Upload a Photo</h3>
              <p className="mt-1 text-sm text-gray-600">Send Vale a photo of your kitchen, bathroom, or any room via WhatsApp</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">2</div>
              <h3 className="mt-3 font-semibold text-navy">AI Renders the Remodel</h3>
              <p className="mt-1 text-sm text-gray-600">Our AI shows you what the renovated room would look like in multiple styles</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">3</div>
              <h3 className="mt-3 font-semibold text-navy">See the ROI</h3>
              <p className="mt-1 text-sm text-gray-600">Get estimated cost, value added, and ROI — data-backed from NJ market comps</p>
            </div>
          </div>
        </div>
      </section>

      {/* Room selector */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">Choose a Room to Simulate</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {roomTypes.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
                className={`rounded-xl border-2 p-4 text-center transition ${
                  selectedRoom === room.id
                    ? "border-gold bg-gold/5 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gold/50 hover:shadow"
                }`}
              >
                <div className="text-3xl">{room.icon}</div>
                <p className="mt-2 text-sm font-semibold text-navy">{room.label}</p>
                <p className="mt-1 text-xs text-gray-500">Cost: {room.avgCost}</p>
                <p className="text-xs text-green-600 font-medium">ROI: {room.avgRoi}</p>
              </button>
            ))}
          </div>

          {selectedRoom && (
            <div className="mt-8 rounded-xl bg-white border border-gold/30 p-6 text-center">
              <p className="text-lg font-bold text-navy">
                Ready to see your {roomTypes.find(r => r.id === selectedRoom)?.label.toLowerCase()} transformed?
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Send Vale a photo of your {roomTypes.find(r => r.id === selectedRoom)?.label.toLowerCase()} on WhatsApp and ask for a renovation simulation.
              </p>
              <a
                href={`https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20see%20a%20${selectedRoom}%20renovation%20simulation`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-[#20bd5a]"
              >
                <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4"><path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" /></svg>
                Send Photo to Vale
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="py-12 bg-navy">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-white">Calculate Your Renovation ROI</h2>
          <p className="mt-2 text-center text-sm text-gray-400">Enter your details below to see if a renovation is worth it in the NJ market</p>

          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-3">
              {/* City/Zip */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">City or ZIP Code</label>
                <input
                  type="text"
                  placeholder="e.g. Paramus or 07652"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              {/* Renovation type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Renovation Type</label>
                <select
                  value={renoId}
                  onChange={(e) => { setRenoId(e.target.value); setResult(null); }}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {renovationTypes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-navy text-white">{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Budget ($)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 15000"
                  value={budgetStr}
                  onChange={(e) => { setBudgetStr(e.target.value.replace(/[^0-9]/g, "")); setResult(null); }}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleCalc}
                disabled={!budgetStr}
                className="rounded-xl bg-gold px-8 py-3 text-sm font-bold text-navy hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Calculate ROI
              </button>
              <span className="text-xs text-gray-500">
                NJ avg multiplier for {selectedReno.label}: {selectedReno.minMultiplier}x &ndash; {selectedReno.maxMultiplier}x
              </span>
            </div>
          </div>

          {/* Result card */}
          {result && (
            <div className="mt-6 rounded-2xl bg-white border-2 border-gold/30 p-6 md:p-8 animate-[fadeIn_0.3s_ease-out]">
              <div className="grid gap-6 md:grid-cols-4">
                {/* Value Added */}
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Estimated Value Added</p>
                  <p className="mt-1 text-2xl font-extrabold text-navy">{fmt(result.valueAdded)}</p>
                  <p className="mt-0.5 text-xs text-gray-400">Range: {fmt(result.rangeMin)} &ndash; {fmt(result.rangeMax)}</p>
                </div>

                {/* Net ROI */}
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Net ROI</p>
                  <p className={`mt-1 text-2xl font-extrabold ${result.roiPercent >= 100 ? "text-green-600" : result.roiPercent >= 0 ? "text-yellow-600" : "text-red-500"}`}>
                    {result.roiPercent >= 0 ? "+" : ""}{result.roiPercent.toFixed(0)}%
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">On a {fmt(parseInt(budgetStr))} investment</p>
                </div>

                {/* Verdict */}
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Worth It?</p>
                  <div className={`mt-1 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${verdictColors[result.verdict]}`}>
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${verdictDots[result.verdict]}`} />
                    {result.verdict === "green" ? "Yes" : result.verdict === "yellow" ? "Maybe" : "No"}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{result.verdictLabel}</p>
                </div>

                {/* NJ Average */}
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">NJ Average ROI</p>
                  <p className="mt-1 text-2xl font-extrabold text-navy">
                    {result.njAvgRoi >= 0 ? "+" : ""}{result.njAvgRoi.toFixed(0)}%
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    You&apos;re {result.roiPercent > result.njAvgRoi ? "above" : result.roiPercent < result.njAvgRoi ? "below" : "at"} average
                  </p>
                </div>
              </div>

              {/* CTA inside result */}
              <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
                <p className="text-sm font-semibold text-navy">
                  Want to see your updated home value{city ? ` in ${city}` : ""}?
                </p>
                <a
                  href="https://gardenstate.ai/sell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-gold hover:text-yellow-600 transition"
                >
                  Get a free CMA at gardenstate.ai/sell
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ROI table */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">Renovation ROI Guide — New Jersey</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Based on national averages adjusted for the NJ market</p>
          <div className="mt-8 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Renovation</th>
                  <th className="px-4 py-3 text-right font-medium">Avg. Cost</th>
                  <th className="px-4 py-3 text-right font-medium">Value Added</th>
                  <th className="px-4 py-3 text-right font-medium">ROI</th>
                </tr>
              </thead>
              <tbody>
                {roiData.map((r, i) => (
                  <tr key={r.renovation} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.renovation}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.cost}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.valueAdded}</td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      r.tier === "high" ? "text-green-600" : r.tier === "medium" ? "text-yellow-600" : "text-red-500"
                    }`}>{r.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-400 text-center">
            Source: National Association of Realtors 2025 Remodeling Impact Report, adjusted for NJ market.
            Actual ROI varies by property condition, location, and market timing.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-12 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold">Want a Personalized Renovation Plan?</h2>
          <p className="mt-2 text-gray-300">
            Vale analyzes your property and tells you exactly which renovations will give you the highest return.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 text-base font-bold text-navy hover:bg-yellow-400">
            Get My Renovation Plan
          </a>
          <p className="mt-3 text-xs text-gray-400">Free when you list with us. $20/room otherwise.</p>
        </div>
      </section>
    </>
  );
}
