"use client";

import { useState, useRef, useEffect } from "react";
import LeadGate from "@/components/LeadGate";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";


const roomTypes = [
  { id: "kitchen", label: "Kitchen", icon: "🍳", avgCost: "$28,000 – $120,000", avgRoi: "55% – 80%" },
  { id: "bathroom", label: "Bathroom", icon: "🛁", avgCost: "$25,000 – $75,000", avgRoi: "60% – 75%" },
  { id: "exterior", label: "Exterior / Curb Appeal", icon: "🏡", avgCost: "$4,200 – $20,000", avgRoi: "70% – 95%" },
  { id: "flooring", label: "Flooring", icon: "🪵", avgCost: "$3,500 – $6,000", avgRoi: "80% – 85%" },
  { id: "systems", label: "Roof / HVAC", icon: "🔧", avgCost: "$8,000 – $22,000", avgRoi: "80% – 85%" },
];

const roiData = [
  { renovation: "Garage Door Replacement", cost: "$4,200 – $5,500", valueAdded: "$4,000 – $5,000", roi: "90 – 95%", tier: "high" },
  { renovation: "Hardwood Floor Refinish", cost: "$3,500 – $6,000", valueAdded: "$3,000 – $5,000", roi: "80 – 85%", tier: "high" },
  { renovation: "New Roof", cost: "$12,000 – $22,000", valueAdded: "$10,000 – $18,000", roi: "80 – 85%", tier: "high" },
  { renovation: "HVAC Replacement", cost: "$8,000 – $15,000", valueAdded: "$7,000 – $12,000", roi: "80 – 85%", tier: "high" },
  { renovation: "Minor Kitchen Remodel", cost: "$28,000 – $35,000", valueAdded: "$22,000 – $28,000", roi: "75 – 80%", tier: "high" },
  { renovation: "Landscaping / Curb Appeal", cost: "$5,000 – $10,000", valueAdded: "$4,000 – $8,000", roi: "75 – 80%", tier: "medium" },
  { renovation: "Bathroom Renovation", cost: "$25,000 – $35,000", valueAdded: "$18,000 – $25,000", roi: "70 – 75%", tier: "medium" },
  { renovation: "Exterior Paint / Siding", cost: "$12,000 – $20,000", valueAdded: "$9,000 – $15,000", roi: "70 – 75%", tier: "medium" },
  { renovation: "Window Replacement", cost: "$15,000 – $25,000", valueAdded: "$10,000 – $16,000", roi: "65 – 70%", tier: "medium" },
  { renovation: "Bathroom Addition", cost: "$55,000 – $75,000", valueAdded: "$35,000 – $45,000", roi: "60 – 65%", tier: "medium" },
  { renovation: "Major Kitchen Remodel", cost: "$75,000 – $120,000", valueAdded: "$45,000 – $65,000", roi: "55 – 60%", tier: "low" },
  { renovation: "Master Suite Addition", cost: "$125,000 – $175,000", valueAdded: "$60,000 – $85,000", roi: "45 – 50%", tier: "low" },
];

type RenovationType = {
  id: string;
  label: string;
  avgMultiplier: number;
  minMultiplier: number;
  maxMultiplier: number;
  minBudget: number;
  maxBudget: number;
};

const renovationTypes: RenovationType[] = [
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

type CalcResult = {
  valueAdded: number;
  roiPercent: number;
  rangeMin: number;
  rangeMax: number;
  verdict: "green" | "yellow" | "red";
  verdictLabel: string;
  njAvgRoi: number;
  budgetWarning: string | null;
};

function calcRoi(budget: number, reno: RenovationType): CalcResult {
  // Check if budget is realistic for this renovation type
  let budgetWarning: string | null = null;
  if (budget < reno.minBudget) {
    budgetWarning = `A typical ${reno.label.toLowerCase()} costs ${fmt(reno.minBudget)}–${fmt(reno.maxBudget)}. Your budget of ${fmt(budget)} is below the minimum — consider a less expensive renovation type.`;
  } else if (budget > reno.maxBudget * 1.5) {
    budgetWarning = `A typical ${reno.label.toLowerCase()} costs ${fmt(reno.minBudget)}–${fmt(reno.maxBudget)}. Your budget of ${fmt(budget)} is well above average — diminishing returns are likely.`;
  }

  // Multiplier represents % of cost recovered (0.78 = 78% recovery)
  const valueAdded = budget * reno.avgMultiplier;
  const recoveryPercent = reno.avgMultiplier * 100;
  const roiPercent = ((valueAdded - budget) / budget) * 100;
  const rangeMin = budget * reno.minMultiplier;
  const rangeMax = budget * reno.maxMultiplier;
  const njAvgRoi = recoveryPercent;

  let verdict: CalcResult["verdict"];
  let verdictLabel: string;
  if (budgetWarning && budget < reno.minBudget) {
    verdict = "red";
    verdictLabel = "Budget too low for this renovation type";
  } else if (recoveryPercent >= 80) {
    verdict = "green";
    verdictLabel = "Strong recovery — recommended upgrade";
  } else if (recoveryPercent >= 60) {
    verdict = "yellow";
    verdictLabel = "Moderate recovery — do it if you'll enjoy it";
  } else {
    verdict = "red";
    verdictLabel = "Low recovery — only if you need the space";
  }

  return { valueAdded, roiPercent, rangeMin, rangeMax, verdict, verdictLabel, njAvgRoi, budgetWarning };
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const verdictColors = { green: "bg-green-100 border-green-500 text-green-800", yellow: "bg-yellow-100 border-yellow-500 text-yellow-800", red: "bg-red-100 border-red-500 text-red-800" };
const verdictDots = { green: "bg-green-500", yellow: "bg-yellow-500", red: "bg-red-500" };

function WebUploadSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("myhome_phone"));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    setSelectedFile(file);
    setError(null);
    setResultUrl(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const phone = localStorage.getItem("myhome_phone");
      if (phone) formData.append("phone", phone);

      const res = await fetch(`${IDX_API}/api/idx/myhome/renovate-upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed. Please try again.");
      }
      const data = await res.json();
      setResultUrl(data.imageUrl || data.url || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
    setUploading(false);
  }

  function reset() {
    setSelectedFile(null);
    setPreview(null);
    setResultUrl(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Or Upload Directly</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>

      {!resultUrl ? (
        <>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-gold hover:bg-gold/5 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              {selectedFile ? selectedFile.name : "Choose Photo"}
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-navy hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {uploading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  Upload &amp; Renovate
                </>
              )}
            </button>
          </div>

          {preview && (
            <div className="mt-4 flex justify-center">
              <div className="relative">
                <img src={preview} alt="Selected photo" className="max-h-48 rounded-lg border border-gray-200 shadow-sm" />
                <button onClick={reset} className="absolute -top-2 -right-2 rounded-full bg-gray-800 p-1 text-white hover:bg-gray-600 transition" title="Remove">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 text-center text-sm text-red-600">{error}</p>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">
            {isLoggedIn
              ? "Your renders are automatically saved to your MyHome Log"
              : "Renders are saved when you have a MyHome Log account"}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="grid gap-4 sm:grid-cols-2 max-w-lg w-full">
            {preview && (
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 mb-1">Before</p>
                <img src={preview} alt="Original" className="rounded-lg border border-gray-200 shadow-sm w-full" />
              </div>
            )}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">After</p>
              <img src={resultUrl} alt="AI Renovation" className="rounded-lg border-2 border-gold/40 shadow-sm w-full" />
            </div>
          </div>

          {isLoggedIn ? (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700 font-medium">
              This render has been saved to your MyHome Log
            </div>
          ) : (
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2.5 text-center">
              <p className="text-sm text-indigo-700 font-medium">Create a free MyHome Log to save all your renders</p>
              <a href="/my-home/log" className="mt-1 inline-block text-sm font-bold text-gold hover:text-yellow-600 transition">
                Create MyHome Log &rarr;
              </a>
            </div>
          )}

          <button onClick={reset} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
            Upload another photo
          </button>
        </div>
      )}
    </div>
  );
}

export default function RenovateSimulator() {
  const [city, setCity] = useState("");
  const [renoId, setRenoId] = useState(renovationTypes[0].id);
  const [budgetStr, setBudgetStr] = useState("");
  const [result, setResult] = useState<CalcResult | null>(null);

  const [budgetError, setBudgetError] = useState("");

  function handleCalc() {
    const budget = parseInt(budgetStr.replace(/\D/g, ""), 10);
    if (!budget || budget <= 0) {
      setBudgetError("Enter a budget amount");
      setResult(null);
      return;
    }
    setBudgetError("");
    const reno = renovationTypes.find((r) => r.id === renoId)!;
    setResult(calcRoi(budget, reno));
  }

  const selectedReno = renovationTypes.find((r) => r.id === renoId)!;

  return (
    <>
      {/* Hero + Before & After */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy">
            Thinking of Renovating{" "}
            <span className="text-gold">Your Home?</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            See exactly what your renovated home would look like — and whether it&apos;s worth the investment.
            Get your AI before &amp; after photo sent directly to your phone.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">1</div>
              <h3 className="mt-3 font-semibold text-navy">Send a Photo</h3>
              <p className="mt-1 text-sm text-gray-600">Text or WhatsApp a photo of your kitchen, bathroom, or any room to Vale</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">2</div>
              <h3 className="mt-3 font-semibold text-navy">AI Renovates It</h3>
              <p className="mt-1 text-sm text-gray-600">Our AI replaces cabinets, countertops, flooring, and paint — keeping your exact layout</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">3</div>
              <h3 className="mt-3 font-semibold text-navy">Get the ROI</h3>
              <p className="mt-1 text-sm text-gray-600">See the estimated cost, value added, and ROI — data-backed from NJ market</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20see%20a%20renovation%20of%20my%20home"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-[#20bd5a]">
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4"><path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" /></svg>
              Send Photo via WhatsApp
            </a>
            <a href="sms:+12015281095?body=Hi%20Vale!%20I%20want%20to%20see%20a%20renovation"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-navy px-6 py-3 text-sm font-bold text-navy hover:bg-navy/5">
              Send Photo via Text
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">10 free renovation renders per user. Unlimited when you list with us.</p>

          {/* Web Upload Section */}
          <WebUploadSection />
        </div>
      </section>

      {/* Average ROI by room */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">Average Renovation ROI by Room</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Based on NJ market data and national remodeling reports</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {roomTypes.map((room) => (
              <div key={room.id} className="rounded-xl border-2 border-gray-200 bg-white p-4 text-center">
                <div className="text-3xl">{room.icon}</div>
                <p className="mt-2 text-sm font-semibold text-navy">{room.label}</p>
                <p className="mt-1 text-xs text-gray-500">Cost: {room.avgCost}</p>
                <p className="text-xs text-green-600 font-medium">ROI: {room.avgRoi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">Calculate Your Renovation ROI</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Enter your details below to see if a renovation is worth it in the NJ market</p>

          <div className="mt-8 rounded-2xl bg-white border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="grid gap-5 md:grid-cols-3">
              {/* City/Zip */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City or ZIP Code</label>
                <input
                  type="text"
                  placeholder="e.g. Paramus or 07652"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              {/* Renovation type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Renovation Type</label>
                <select
                  value={renoId}
                  onChange={(e) => { setRenoId(e.target.value); setResult(null); }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {renovationTypes.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Budget ($)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 15000"
                  value={budgetStr}
                  onChange={(e) => { setBudgetStr(e.target.value.replace(/[^0-9]/g, "")); setResult(null); setBudgetError(""); }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
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
              {budgetError && <span className="text-xs text-red-500">{budgetError}</span>}
              <span className="text-xs text-gray-500">
                NJ avg recovery for {selectedReno.label}: {(selectedReno.minMultiplier * 100).toFixed(0)}% &ndash; {(selectedReno.maxMultiplier * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Result card */}
          {result && (
            <div className="mt-6 rounded-2xl bg-white border-2 border-gold/30 p-6 md:p-8 animate-[fadeIn_0.3s_ease-out]">
              {result.budgetWarning && (
                <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
                  {result.budgetWarning}
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-4">
                {/* Value Added */}
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Estimated Value Added</p>
                  <p className="mt-1 text-2xl font-extrabold text-navy">{fmt(result.valueAdded)}</p>
                  <p className="mt-0.5 text-xs text-gray-400">Range: {fmt(result.rangeMin)} &ndash; {fmt(result.rangeMax)}</p>
                </div>

                {/* Cost Recovery */}
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Cost Recovery</p>
                  <p className={`mt-1 text-2xl font-extrabold ${result.njAvgRoi >= 80 ? "text-green-600" : result.njAvgRoi >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                    {result.njAvgRoi.toFixed(0)}%
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">Of your {fmt(parseInt(budgetStr))} investment</p>
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

                {/* Net Cost */}
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Net Cost to You</p>
                  <p className="mt-1 text-2xl font-extrabold text-navy">
                    {fmt(parseInt(budgetStr) - result.valueAdded)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    What you don&apos;t recover at sale
                  </p>
                </div>
              </div>

              {/* Lead capture */}
              <div className="mt-6">
                <LeadGate
                  inline={true}
                  valueProp="Get AI Renovation Renderings"
                  source="renovate_sim"
                  message={`${selectedReno.label} | Budget: ${fmt(parseInt(budgetStr))} | Recovery: ${result.njAvgRoi.toFixed(0)}% | ${result.verdictLabel}`}
                  resultsText={`🔨 *Renovation Analysis*\n\nProject: ${selectedReno.label}\nBudget: ${fmt(parseInt(budgetStr))}\nEst. Value Added: ${fmt(result.valueAdded)}\nCost Recovery: ${result.njAvgRoi.toFixed(0)}%\nNet Cost: ${fmt(parseInt(budgetStr) - result.valueAdded)}\nVerdict: ${result.verdictLabel}\n\nGet a free CMA: gardenstate.ai/sell\n— Garden State AI`}
                />
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
          <h2 className="text-center text-2xl font-bold text-navy">Renovation Cost Recovery Guide — New Jersey</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Conservative estimates based on NAR 2025 Remodeling Impact Report, adjusted for NJ costs</p>
          <div className="mt-8 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Renovation</th>
                  <th className="px-4 py-3 text-right font-medium">Avg. Cost</th>
                  <th className="px-4 py-3 text-right font-medium">Value Added</th>
                  <th className="px-4 py-3 text-right font-medium">Recovery</th>
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
            Source: NAR 2025 Remodeling Impact Report &amp; Remodeling Magazine Cost vs. Value 2025, adjusted for NJ labor &amp; material costs.
            Recovery % = how much of your renovation cost you recoup at sale. Actual results vary by property condition, location, and market timing.
            These are conservative estimates — not guarantees.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-12 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-navy">Ready to Sell Your Home?</h2>
          <p className="mt-2 text-gray-500">
            Get a free AI-powered valuation and see how renovations could maximize your sale price.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="/sell"
              className="rounded-xl bg-gold px-8 py-3.5 text-base font-bold text-navy hover:bg-yellow-400">
              Get My Free Valuation
            </a>
            <a href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20see%20a%20renovation%20of%20my%20home"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-3.5 text-base font-bold text-white hover:bg-[#20bd5a]">
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4"><path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" /></svg>
              Send a Photo to Vale
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
