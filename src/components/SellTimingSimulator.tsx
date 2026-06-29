"use client";

import { useState } from "react";
import Link from "next/link";
import SmsConsent from "./SmsConsent";
const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";
import { submitLead } from "@/lib/api";

type PropertyType = "Single Family" | "Condo" | "Townhouse" | "Multi-Family";

interface MarketData {
  activeCount: number;
  soldCount: number;
  pendingCount: number;
  avgActivePrice: number;
  avgSoldPrice: number;
  medianSoldPrice: number;
  absorptionMonths: string | null;
  trend: string;
  appreciation: number | null;
  investScore: number | null;
  avgTax: number | null;
}

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

function projectValue(currentValue: number, monthsAhead: number, annualRate: number): Projection {
  const now = new Date();
  let projected = currentValue;
  const seasonalNotes: string[] = [];

  for (let i = 1; i <= monthsAhead; i++) {
    const futureMonth = (now.getMonth() + i) % 12;
    const seasonal = getSeasonalAdjustment(futureMonth);
    const monthlyRate = (annualRate + seasonal.pct) / 12 / 100;
    projected *= 1 + monthlyRate;
    if (i === monthsAhead) seasonalNotes.push(seasonal.label);
  }

  const appreciation = projected - currentValue;
  const SELL_COSTS = 0.06;
  const netProceeds = projected * (1 - SELL_COSTS);

  const labels: Record<number, string> = { 0: "Now", 3: "3 Months", 6: "6 Months", 12: "12 Months" };

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

function marketVerdict(market: MarketData): { label: string; color: string; explanation: string } {
  const abs = market.absorptionMonths ? parseFloat(market.absorptionMonths) : null;
  if (abs !== null && abs < 4) return { label: "Seller's Market", color: "text-green-600", explanation: "Low inventory and high demand — sellers have the advantage." };
  if (abs !== null && abs > 6) return { label: "Buyer's Market", color: "text-red-500", explanation: "High inventory gives buyers negotiating power — pricing is critical." };
  return { label: "Balanced Market", color: "text-blue-600", explanation: "Supply and demand are roughly equal — properly priced homes sell well." };
}

export default function SellTimingSimulator() {
  const [homeValue, setHomeValue] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("Single Family");
  const [projections, setProjections] = useState<Projection[] | null>(null);
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(homeValue.replace(/[^0-9]/g, ""));
    if (!value || value < 10000) return;
    if (!city.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${IDX_API}/api/idx/market/${encodeURIComponent(city.trim())}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();

      const stats = data.stats || {};
      const inv = data.investment || {};

      const mkt: MarketData = {
        activeCount: stats.activeCount || 0,
        soldCount: stats.soldCount || 0,
        pendingCount: stats.pendingCount || 0,
        avgActivePrice: stats.avgActivePrice || 0,
        avgSoldPrice: stats.avgSoldPrice || 0,
        medianSoldPrice: stats.medianSoldPrice || 0,
        absorptionMonths: stats.absorptionMonths || null,
        trend: stats.trend || "stable",
        appreciation: inv.appreciation ?? null,
        investScore: inv.investScore ?? null,
        avgTax: inv.avgTax ?? null,
      };

      // Not enough data — require at least some sales to project
      if ((stats.soldCount || 0) < 3 && inv.appreciation === null) {
        setMarket(mkt);
        setError(`Not enough recent sales data in ${city.trim()} to generate reliable projections. Try a nearby larger city.`);
        setLoading(false);
        return;
      }

      // Build annual rate from real data, combining multiple signals
      let annualRate = 3.5; // NJ baseline
      if (inv.appreciation !== null) {
        annualRate = inv.appreciation;
      }
      // Adjust by absorption (seller's market = faster appreciation)
      const abs = stats.absorptionMonths ? parseFloat(stats.absorptionMonths) : null;
      if (abs !== null) {
        if (abs < 3) annualRate += 2;       // very hot market
        else if (abs < 4) annualRate += 1;  // seller's market
        else if (abs > 8) annualRate -= 2;  // buyer's market
        else if (abs > 6) annualRate -= 1;  // cooling
      }
      // Adjust by trend
      if (stats.trend === "up" && inv.appreciation === null) annualRate += 1;
      if (stats.trend === "down") annualRate -= 1.5;

      setMarket(mkt);

      const now: Projection = {
        months: 0, label: "Now", value,
        netProceeds: Math.round(value * 0.94),
        appreciation: 0,
        seasonalNote: getSeasonalAdjustment(new Date().getMonth()).label,
      };

      setProjections([
        now,
        projectValue(value, 3, annualRate),
        projectValue(value, 6, annualRate),
        projectValue(value, 12, annualRate),
      ]);
    } catch {
      setError("Could not find market data for that city. Make sure it's a valid NJ city name.");
    }
    setLoading(false);
  }

  function reset() {
    setProjections(null);
    setMarket(null);
    setHomeValue("");
    setCity("");
    setError("");
  }

  const currentMonth = new Date().getMonth();
  const currentSeason = getSeasonalAdjustment(currentMonth);

  return (
    <>
      <section className="bg-white py-10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy">
            Should You Sell <span className="text-gold">Now or Wait?</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            See how your home&apos;s value could change based on real market data for your city.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          {!projections ? (
            <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 rounded-xl border bg-white p-6 shadow-sm">
              <div>
                <label className="text-sm font-medium text-gray-700">Estimated Home Value</label>
                <input type="text" value={homeValue} onChange={(e) => setHomeValue(e.target.value)}
                  placeholder="$450,000" required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City / Town</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hoboken, Montclair, Garfield" required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Property Type</label>
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none">
                  <option>Single Family</option>
                  <option>Condo</option>
                  <option>Townhouse</option>
                  <option>Multi-Family</option>
                </select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40">
                {loading ? "Analyzing market data..." : "Show My Projections"}
              </button>
            </form>
          ) : (
            <>
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
                    <div key={p.months}
                      className={`rounded-xl border p-5 shadow-sm ${isNow ? "border-gold bg-navy text-white" : "border-gray-200 bg-white"}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${isNow ? "text-gold" : "text-gray-400"}`}>
                        {isNow ? "If You Sell Now" : `If You Wait ${p.label}`}
                      </p>
                      <p className={`mt-2 text-2xl font-extrabold ${isNow ? "text-white" : "text-navy"}`}>{fmt(p.value)}</p>
                      {!isNow && (
                        <p className={`mt-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
                          {isPositive ? "+" : ""}{fmt(p.appreciation)}
                        </p>
                      )}
                      <div className={`mt-3 border-t pt-3 ${isNow ? "border-white/20" : "border-gray-100"}`}>
                        <p className={`text-xs ${isNow ? "text-gray-300" : "text-gray-400"}`}>Est. Net Proceeds (after 6% costs)</p>
                        <p className={`text-lg font-bold ${isNow ? "text-gold" : "text-navy"}`}>{fmt(p.netProceeds)}</p>
                      </div>
                      <p className={`mt-2 text-xs ${isNow ? "text-gray-400" : "text-gray-400"}`}>{p.seasonalNote}</p>
                    </div>
                  );
                })}
              </div>

              {/* Real market data */}
              {market && (
                <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-navy">Real Market Data for {city}</h2>
                  <p className="mt-1 text-sm text-gray-500">Based on MLS sales data from the last 90 days.</p>

                  {/* Market verdict */}
                  {(() => {
                    const v = marketVerdict(market);
                    return (
                      <div className="mt-4 rounded-lg bg-gray-50 p-4 border-l-4 border-current" style={{ borderColor: v.color === "text-green-600" ? "#16a34a" : v.color === "text-red-500" ? "#ef4444" : "#2563eb" }}>
                        <p className={`text-lg font-bold ${v.color}`}>{v.label}</p>
                        <p className="text-sm text-gray-600 mt-1">{v.explanation}</p>
                      </div>
                    );
                  })()}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-navy">Price Trend</p>
                      <p className={`mt-1 text-2xl font-bold ${market.appreciation !== null && market.appreciation >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {market.appreciation !== null ? `${market.appreciation >= 0 ? "+" : ""}${market.appreciation}%` : "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {market.trend === "up" ? "Prices rising" : market.trend === "down" ? "Prices declining" : "Prices stable"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-navy">Avg Sale Price</p>
                      <p className="mt-1 text-2xl font-bold text-navy">{market.avgSoldPrice > 0 ? fmt(market.avgSoldPrice) : "N/A"}</p>
                      <p className="mt-1 text-xs text-gray-500">{market.soldCount} sales last 90 days</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-navy">Months of Supply</p>
                      <p className={`mt-1 text-2xl font-bold ${market.absorptionMonths && parseFloat(market.absorptionMonths) < 4 ? "text-green-600" : market.absorptionMonths && parseFloat(market.absorptionMonths) > 6 ? "text-red-500" : "text-navy"}`}>
                        {market.absorptionMonths || "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{market.activeCount} active / {market.pendingCount} pending</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-navy">Current Season</p>
                      <p className={`mt-1 text-2xl font-bold ${currentSeason.pct >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {currentSeason.pct >= 0 ? "+" : ""}{currentSeason.pct}%
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{currentSeason.label}</p>
                    </div>
                  </div>

                  {market.avgTax && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Avg. annual property tax in {city}: <span className="font-semibold text-navy">{fmt(market.avgTax)}</span>
                        {market.investScore && <> · Investment score: <span className="font-semibold text-navy">{market.investScore}/100</span></>}
                      </p>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-400">
                    Projections use real appreciation data from {city} MLS sales combined with seasonal patterns.
                    Actual results will vary based on property condition, improvements, and economic changes.
                    This is not an appraisal.
                  </p>
                </div>
              )}

              {/* Lead capture */}
              <div className="mt-10">
                <SellTimingLeadCapture city={city} propertyType={propertyType} projections={projections} fmt={fmt} />
              </div>

              {/* CTAs */}
              <div className="mt-10 space-y-4 text-center">
                <Link href="/sell"
                  className="inline-block w-full max-w-md rounded-lg bg-gold px-8 py-4 text-lg font-bold text-navy hover:bg-yellow-400">
                  Ready to Sell? Get Your Free Valuation
                </Link>
                <br />
                <Link href="/my-home" className="inline-block text-sm font-medium text-gray-500 underline hover:text-navy">
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

function SellTimingLeadCapture({ city, propertyType, projections, fmt }: {
  city: string; propertyType: string; projections: Projection[]; fmt: (n: number) => string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) { setErr("Name and phone number are required"); return; }
    if (!consent) { setErr("Please accept the messaging consent"); return; }
    setSending(true); setErr("");
    try {
      const p = projections;
      const results = [
        `Sell Timing Analysis - ${city}, NJ`,
        `Property: ${propertyType}`,
        `Current Value: ${fmt(p[0].value)}`,
        `3 Months: ${fmt(p[1].value)} (${p[1].appreciation >= 0 ? "+" : ""}${fmt(p[1].appreciation)})`,
        `6 Months: ${fmt(p[2].value)} (${p[2].appreciation >= 0 ? "+" : ""}${fmt(p[2].appreciation)})`,
        `12 Months: ${fmt(p[3].value)} (${p[3].appreciation >= 0 ? "+" : ""}${fmt(p[3].appreciation)})`,
        ``, `Free valuation: gardenstate.ai/sell`, `Reply STOP to opt out.`,
      ].join("\n");
      const r = await fetch(`${IDX_API}/api/idx/send-results`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name.trim(), phone: phone.trim(), channel: "sms", tool: "sell_timing", results }),
      });
      if (!r.ok) throw new Error("Send failed");
      setSent(true);
    } catch { setErr("Could not send. Please try again."); }
    setSending(false);
  }

  const inputCls = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500";

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="text-4xl mb-3">{"\u2705"}</div>
        <h3 className="text-xl font-bold text-navy">Sent, {name.split(" ")[0]}!</h3>
        <p className="text-gray-600 mt-2">Check your phone — your sell timing analysis has been texted to you.</p>
        <p className="text-gray-400 text-sm mt-4">Want a full home valuation? <a href="/sell" className="text-indigo-600 underline">Get one free here</a></p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h3 className="text-xl font-bold text-navy">Send My Results</h3>
      <p className="text-gray-500 text-sm mt-1">We&apos;ll text you the complete analysis instantly.</p>
      <div className="mt-5 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputCls} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" type="tel" className={inputCls} />
        <SmsConsent checked={consent} onChange={setConsent} />
      </div>
      {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
      <button onClick={handleSubmit} disabled={sending}
        className="mt-4 w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 transition disabled:opacity-40">
        {sending ? "Sending..." : "Text Me My Results"}
      </button>
    </div>
  );
}
