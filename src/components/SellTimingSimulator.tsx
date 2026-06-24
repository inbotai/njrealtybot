"use client";

import { useState } from "react";
import Link from "next/link";
const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";
import { submitLead } from "@/lib/api";

type PropertyType = "Single Family" | "Condo" | "Townhouse" | "Multi-Family";

interface Projection {
  months: number;
  label: string;
  value: number;
  netProceeds: number;
  appreciation: number;
  seasonalNote: string;
}

function getSeasonalAdjustment(month: number): { pct: number; label: string } {
  if (month >= 2 && month <= 4) return { pct: 2, label: "Spring (peak demand)" };
  if (month >= 5 && month <= 7) return { pct: 1, label: "Summer (strong activity)" };
  if (month >= 8 && month <= 10) return { pct: -1, label: "Fall (cooling market)" };
  return { pct: -2, label: "Winter (slowest season)" };
}

function projectValue(currentValue: number, monthsAhead: number): Projection {
  const BASE_ANNUAL = 3.5;
  const RATE_DRAG = -0.5;
  const now = new Date();
  let projected = currentValue;

  const seasonalNotes: string[] = [];

  for (let i = 1; i <= monthsAhead; i++) {
    const futureMonth = (now.getMonth() + i) % 12;
    const seasonal = getSeasonalAdjustment(futureMonth);
    const monthlyRate = (BASE_ANNUAL + seasonal.pct + RATE_DRAG) / 12 / 100;
    projected *= 1 + monthlyRate;
    if (i === monthsAhead) {
      seasonalNotes.push(seasonal.label);
    }
  }

  const appreciation = projected - currentValue;
  const SELL_COSTS = 0.06;
  const netProceeds = projected * (1 - SELL_COSTS);

  const labels: Record<number, string> = {
    0: "Now",
    3: "3 Months",
    6: "6 Months",
    12: "12 Months",
  };

  return {
    months: monthsAhead,
    label: labels[monthsAhead] || `${monthsAhead} Months`,
    value: Math.round(projected),
    netProceeds: Math.round(netProceeds),
    appreciation: Math.round(appreciation),
    seasonalNote: seasonalNotes[0] || "",
  };
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function SellTimingSimulator() {
  const [homeValue, setHomeValue] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("Single Family");
  const [projections, setProjections] = useState<Projection[] | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(homeValue.replace(/[^0-9]/g, ""));
    if (!value || value < 10000) return;

    const now: Projection = {
      months: 0,
      label: "Now",
      value,
      netProceeds: Math.round(value * 0.94),
      appreciation: 0,
      seasonalNote: getSeasonalAdjustment(new Date().getMonth()).label,
    };

    setProjections([
      now,
      projectValue(value, 3),
      projectValue(value, 6),
      projectValue(value, 12),
    ]);
  }

  function reset() {
    setProjections(null);
    setHomeValue("");
    setCity("");
  }

  const currentMonth = new Date().getMonth();
  const currentSeason = getSeasonalAdjustment(currentMonth);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            Should You Sell{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Now or Wait?
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            See how your home&apos;s value could change over 3, 6, and 12 months based on NJ market trends.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          {!projections ? (
            <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 rounded-xl border bg-white p-6 shadow-sm">
              <div>
                <label className="text-sm font-medium text-gray-700">Estimated Home Value</label>
                <input
                  type="text"
                  value={homeValue}
                  onChange={(e) => setHomeValue(e.target.value)}
                  placeholder="$450,000"
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City / Town</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hoboken, Montclair, Princeton"
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none"
                >
                  <option>Single Family</option>
                  <option>Condo</option>
                  <option>Townhouse</option>
                  <option>Multi-Family</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400"
              >
                Show My Projections
              </button>
            </form>
          ) : (
            <>
              {/* Header with reset */}
              <div className="mb-8 text-center">
                <p className="text-sm text-gray-500">
                  {propertyType} in <span className="font-semibold text-navy">{city}</span>
                </p>
                <button onClick={reset} className="mt-1 text-sm text-gold underline hover:text-yellow-500">
                  Start over
                </button>
              </div>

              {/* Projection cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {projections.map((p) => {
                  const isNow = p.months === 0;
                  const isPositive = p.appreciation >= 0;
                  return (
                    <div
                      key={p.months}
                      className={`rounded-xl border p-5 shadow-sm ${
                        isNow ? "border-gold bg-navy text-white" : "border-gray-200 bg-white"
                      }`}
                    >
                      <p className={`text-xs font-semibold uppercase tracking-wide ${isNow ? "text-gold" : "text-gray-400"}`}>
                        {isNow ? "If You Sell Now" : `If You Wait ${p.label}`}
                      </p>
                      <p className={`mt-2 text-2xl font-extrabold ${isNow ? "text-white" : "text-navy"}`}>
                        {fmt(p.value)}
                      </p>
                      {!isNow && (
                        <p className={`mt-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
                          {isPositive ? "+" : ""}{fmt(p.appreciation)}
                        </p>
                      )}
                      <div className={`mt-3 border-t pt-3 ${isNow ? "border-white/20" : "border-gray-100"}`}>
                        <p className={`text-xs ${isNow ? "text-gray-300" : "text-gray-400"}`}>Est. Net Proceeds (after 6% costs)</p>
                        <p className={`text-lg font-bold ${isNow ? "text-gold" : "text-navy"}`}>
                          {fmt(p.netProceeds)}
                        </p>
                      </div>
                      <p className={`mt-2 text-xs ${isNow ? "text-gray-400" : "text-gray-400"}`}>
                        {p.seasonalNote}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Market Factors */}
              <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-navy">Market Factors Driving This Projection</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-navy">NJ Base Appreciation</p>
                    <p className="mt-1 text-2xl font-bold text-navy">+3.5%</p>
                    <p className="mt-1 text-xs text-gray-500">Annual average based on statewide trends</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-navy">Current Season</p>
                    <p className={`mt-1 text-2xl font-bold ${currentSeason.pct >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {currentSeason.pct >= 0 ? "+" : ""}{currentSeason.pct}%
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{currentSeason.label}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-navy">Interest Rate Impact</p>
                    <p className="mt-1 text-2xl font-bold text-red-500">-0.5%</p>
                    <p className="mt-1 text-xs text-gray-500">High rates are suppressing buyer demand</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-navy">Effective Annual Rate</p>
                    <p className="mt-1 text-2xl font-bold text-navy">
                      {(3.5 + currentSeason.pct - 0.5).toFixed(1)}%
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Combined rate for the current season</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  These projections are estimates based on historical NJ market averages and seasonal patterns.
                  Actual results will vary based on local conditions, property improvements, and economic changes.
                </p>
              </div>

              {/* Lead capture */}
              <div className="mt-10">
                <SellTimingLeadCapture
                  city={city}
                  propertyType={propertyType}
                  projections={projections}
                  fmt={fmt}
                />
              </div>

              {/* CTAs */}
              <div className="mt-10 space-y-4 text-center">
                <Link
                  href="/sell"
                  className="inline-block w-full max-w-md rounded-lg bg-gold px-8 py-4 text-lg font-bold text-navy hover:bg-yellow-400"
                >
                  Ready to Sell? Get Your Free Valuation
                </Link>
                <br />
                <Link
                  href="/my-home"
                  className="inline-block text-sm font-medium text-gray-500 underline hover:text-navy"
                >
                  Not sure? Track your home value
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

/** Lead capture → contact Vale for results — sell-timing only */
function SellTimingLeadCapture({ city, propertyType, projections, fmt }: {
  city: string; propertyType: string; projections: Projection[]; fmt: (n: number) => string;
}) {
  const [step, setStep] = useState<"name" | "phone" | "channel" | "done">("name");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleName() {
    if (!name.trim()) return;
    setStep("phone");
  }

  async function handlePhone() {
    if (!phone.trim()) return;
    setStep("channel");
    // Save lead (non-blocking)
    setSaving(true);
    const msg = `Sell timing analysis: ${propertyType} in ${city}. Current: ${fmt(projections[0].value)}, 12mo: ${fmt(projections[3].value)}`;
    submitLead({ full_name: name.trim(), phone: phone.trim(), message: msg, lead_type: "info_request", source: "sell_timing" }).catch(() => {});
    setSaving(false);
  }

  function handleChannel(ch: "whatsapp" | "text") {
    setStep("done");
  }

  const inputCls = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500";
  const btnCls = "w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 transition";

  if (step === "done") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="text-4xl mb-3">{"\u2705"}</div>
        <h3 className="text-xl font-bold text-navy">Your analysis is ready, {name.split(" ")[0]}!</h3>
        <p className="text-gray-600 mt-3">Just send us a message to receive your full Sell Timing report:</p>
        <div className="mt-5 space-y-3">
          <a href={`https://wa.me/12015281095?text=${encodeURIComponent(`I need my sell timing analysis for ${city}`)}`} target="_blank" rel="noopener noreferrer" className="block w-full rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700 transition text-center">
            Open WhatsApp
          </a>
          <p className="text-gray-400 text-sm">or text <strong>(201) 528-1095</strong> and say &ldquo;I need my sell timing analysis for {city}&rdquo;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h3 className="text-xl font-bold text-navy">Get Your Full Report</h3>
      <p className="text-gray-500 text-sm mt-1">We&apos;ll send you the complete analysis with personalized recommendations.</p>
      <div className="mt-5 space-y-3">
        {step === "name" && (
          <>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputCls} onKeyDown={e => e.key === "Enter" && handleName()} />
            <button onClick={handleName} className={btnCls}>Continue</button>
          </>
        )}
        {step === "phone" && (
          <>
            <p className="text-gray-600 text-sm">Thanks, {name.split(" ")[0]}! What&apos;s your phone number?</p>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" type="tel" className={inputCls} onKeyDown={e => e.key === "Enter" && handlePhone()} />
            <button onClick={handlePhone} disabled={saving} className={btnCls}>Continue</button>
          </>
        )}
        {step === "channel" && (
          <>
            <p className="text-gray-600 text-sm">How would you like to receive your report?</p>
            <div className="flex gap-3">
              <button onClick={() => handleChannel("whatsapp")} className="flex-1 rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700 transition">WhatsApp</button>
              <button onClick={() => handleChannel("text")} className="flex-1 rounded-lg border-2 border-gray-300 py-3 font-bold text-gray-700 hover:border-indigo-500 transition">Text Message</button>
            </div>
          </>
        )}
      </div>
      <p className="text-gray-400 text-xs mt-4 text-center">No spam, ever. We&apos;ll only send what you requested.</p>
    </div>
  );
}
