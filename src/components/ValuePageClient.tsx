"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VoiceButton from "./VoiceButton";
import SellScoreResult from "./SellScoreResult";

const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";

interface ValuationResult {
  address: string;
  estimatedValue: number;
  lowRange: number;
  highRange: number;
  assessedValue: number;
  taxAmount: number;
  sellScore: number;
  sellScoreLabel: string;
  seasonFactor: string;
  equityEstimate: number | null;
  city: string;
  pricePerSqft: number | null;
  yearBuilt: number | null;
}

function computeSellScore(data: any): { score: number; label: string; season: string } {
  const now = new Date();
  const month = now.getMonth();

  // Seasonal factor (0-25 points)
  let seasonPts = 10;
  let seasonLabel = "Neutral";
  if (month >= 2 && month <= 4) { seasonPts = 25; seasonLabel = "Peak Spring Market"; }
  else if (month >= 5 && month <= 6) { seasonPts = 20; seasonLabel = "Strong Summer Market"; }
  else if (month === 1 || month === 7) { seasonPts = 15; seasonLabel = "Good Market"; }
  else if (month >= 8 && month <= 9) { seasonPts = 10; seasonLabel = "Fall Slowdown"; }
  else { seasonPts = 5; seasonLabel = "Winter Market"; }

  // Value vs assessment (0-25 points) — if value > assessed, good time to sell
  let valuePts = 12;
  if (data.estimatedValue && data.assessedValue && data.assessedValue > 0) {
    const ratio = data.estimatedValue / data.assessedValue;
    if (ratio > 1.3) valuePts = 25;
    else if (ratio > 1.15) valuePts = 20;
    else if (ratio > 1.0) valuePts = 15;
    else valuePts = 8;
  }

  // Market demand proxy (0-25 points) — based on price range demand
  let demandPts = 15;
  const est = data.estimatedValue || 0;
  if (est >= 300000 && est <= 600000) demandPts = 25; // highest demand bracket in NJ
  else if (est >= 200000 && est < 300000) demandPts = 20;
  else if (est > 600000 && est <= 900000) demandPts = 18;
  else if (est > 900000) demandPts = 12;
  else demandPts = 10;

  // Confidence bonus (0-25 points)
  let confPts = 15;
  if (data.confidence === "high") confPts = 25;
  else if (data.confidence === "medium") confPts = 18;
  else confPts = 12;

  const score = Math.min(100, seasonPts + valuePts + demandPts + confPts);
  let label = "Consider Waiting";
  if (score >= 80) label = "Excellent Time to Sell";
  else if (score >= 65) label = "Good Time to Sell";
  else if (score >= 50) label = "Fair Market";
  else label = "Consider Waiting";

  return { score, label, season: seasonLabel };
}

export default function ValuePageClient() {
  const [address, setAddress] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    await fetchValuation(address.trim());
  }

  async function handleVoice(text: string) {
    setAddress(text);
    await fetchValuation(text);
  }

  async function fetchValuation(addr: string) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${IDX_API}/api/idx/intelligence/pricing-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });

      if (!res.ok) {
        setError("We couldn't find that address. Try including the city (e.g. '123 Main St, Hoboken')");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const { score, label, season } = computeSellScore(data);

      setResult({
        address: data.address || addr,
        estimatedValue: data.estimatedValue || 0,
        lowRange: data.lowRange || 0,
        highRange: data.highRange || 0,
        assessedValue: data.assessedValue || 0,
        taxAmount: data.taxAmount || 0,
        sellScore: score,
        sellScoreLabel: label,
        seasonFactor: season,
        equityEstimate: data.equityEstimate || null,
        city: data.city || "",
        pricePerSqft: data.pricePerSqft || null,
        yearBuilt: data.yearBuilt || null,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Result view
  if (result) {
    return <SellScoreResult result={result} onReset={() => { setResult(null); setAddress(""); }} />;
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center bg-white overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-4 text-center w-full py-12">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest">
            Free Instant Valuation
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-navy">
            What&apos;s Your Home{" "}
            <span className="text-gold">
              Worth?
            </span>
          </h1>
          <p className="mt-5 text-xl text-gray-500 md:text-2xl">
            Get your <span className="text-navy font-semibold">Sell Score</span> and instant AI valuation.
            <br className="hidden md:block" />
            Takes 30 seconds. 100% free.
          </p>

          {/* Address input */}
          <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl">
            <div className="flex overflow-hidden rounded-2xl bg-white shadow-2xl shadow-gold/10 px-4 py-2 items-center gap-2">
              {!voiceActive && (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address... (e.g. 36 Clark Ave, Bloomfield)"
                  className="flex-1 px-2 py-4 text-lg text-gray-800 outline-none placeholder:text-gray-400"
                  autoFocus
                />
              )}
              <VoiceButton onTranscript={handleVoice} onRecordingChange={setVoiceActive} />
              {!voiceActive && (
                <button
                  type="submit"
                  disabled={!address.trim() || loading}
                  className="rounded-xl bg-gold px-8 py-3 text-base font-bold text-navy transition hover:bg-yellow-400 disabled:opacity-40 whitespace-nowrap"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    "Get My Value"
                  )}
                </button>
              )}
            </div>
            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}
            <p className="mt-4 text-sm text-gray-500">
              Works for any property in New Jersey
            </p>
          </form>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <span>50,000+ properties</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span>AI-powered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>30-second results</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>No sign-up needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-white py-12 border-b">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-center text-sm text-gray-400 uppercase tracking-widest mb-6">
            Trusted by NJ homeowners
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Maria G.", city: "Bloomfield", text: "I found out my home was worth $80K more than I thought. Sold above asking!" },
              { name: "James R.", city: "Paramus", text: "The Sell Score told me it was a great time to sell. Got 3 offers in a week." },
              { name: "Sandra L.", city: "Fort Lee", text: "Shared the valuation with my neighbor — now she's selling too!" },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border p-5 text-center">
                <p className="text-sm text-gray-600 italic">&quot;{t.text}&quot;</p>
                <p className="mt-3 text-sm font-semibold text-navy">{t.name}</p>
                <p className="text-xs text-gray-400">{t.city}, NJ</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
