"use client";

import { useEffect, useState } from "react";
import { fetchDeals, type DealOpportunity } from "@/lib/api";
import Link from "next/link";
import { submitLead } from "@/lib/api";
import SmsConsent from "./SmsConsent";
import { DEALS_NEUTRAL_MODE } from "@/lib/config";

function dealSlug(d: DealOpportunity): string {
  const full = [d.address, d.city, "NJ"].filter(Boolean).join(" ");
  const slug = full.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${d.listingId}-${slug}`;
}

function DealCard({ d, isRental }: { d: DealOpportunity; isRental?: boolean }) {
  return (
    <Link href={`/property/${dealSlug(d)}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{d.address}</h3>
            {isRental && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Rental</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{d.city} | MLS# {d.mlsNumber}{d.daysOnMarket > 0 ? ` | ${d.daysOnMarket} days` : ""}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            ${d.listPrice.toLocaleString()}{isRental ? "/mo" : ""}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!DEALS_NEUTRAL_MODE && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            d.probability >= 60 ? "bg-green-100 text-green-800"
            : d.probability >= 40 ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-600"
          }`}>
            {isRental ? "Great deal" : `${d.probability}% probability`}
          </span>
        )}
        {DEALS_NEUTRAL_MODE && d.signals.length > 0 && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {d.signals.length} market signal{d.signals.length > 1 ? "s" : ""}
          </span>
        )}
        {d.signals.map((s, i) => (
          <span key={i} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{s}</span>
        ))}
      </div>
    </Link>
  );
}

export default function DealsPageClient() {
  const [deals, setDeals] = useState<DealOpportunity[]>([]);
  const [rentalDeals, setRentalDeals] = useState<DealOpportunity[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"sales" | "rentals" | "all">("all");

  async function loadDeals(c?: string) {
    setLoading(true);
    const result = await fetchDeals(c || undefined, 20);
    setDeals(result.deals || []);
    setRentalDeals(result.rentalDeals || []);
    setLoading(false);
  }

  useEffect(() => { loadDeals(); }, []);

  const shown = tab === "sales" ? deals
    : tab === "rentals" ? rentalDeals
    : [...deals, ...rentalDeals];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-navy">Hidden Deals</h1>
      <p className="mt-2 text-gray-500">
        AI-powered deal detection: properties likely to drop in price + below-market rentals.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text" value={city} onChange={e => setCity(e.target.value)}
          placeholder="Filter by city (e.g. Hoboken)"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          onKeyDown={e => e.key === "Enter" && loadDeals(city)}
        />
        <button onClick={() => loadDeals(city)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Search
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {([["all", `All (${deals.length + rentalDeals.length})`], ["sales", `Sales (${deals.length})`], ["rentals", `Rentals (${rentalDeals.length})`]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-gray-400">Analyzing market data...</p>
      ) : shown.length === 0 ? (
        <p className="mt-8 text-gray-400">No deals found. Try a different city.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {tab === "all" && deals.length > 0 && (
            <h2 className="text-lg font-bold text-gray-800 mt-4">Sale Deals — Likely Price Drops</h2>
          )}
          {(tab === "all" || tab === "sales") && deals.map(d => (
            <DealCard key={d.listingId} d={d} />
          ))}
          {tab === "all" && rentalDeals.length > 0 && (
            <h2 className="text-lg font-bold text-gray-800 mt-8">Rental Deals — Below Market Rate</h2>
          )}
          {(tab === "all" || tab === "rentals") && rentalDeals.map(d => (
            <DealCard key={d.listingId} d={d} isRental />
          ))}
        </div>
      )}

      <DealsLeadCapture deals={deals} />
    </div>
  );
}

const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";

const DEAL_CATEGORIES = [
  "Single Family", "Multi-Family", "Condo/Townhouse", "Land/Lots", "Rentals", "Commercial",
];

function DealsLeadCapture({ deals }: { deals: DealOpportunity[] }) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleCat(cat: string) {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) { setError("Name and phone are required"); return; }
    if (categories.length === 0) { setError("Select at least one property type"); return; }
    if (!consent) { setError("Please accept the messaging consent"); return; }
    setSaving(true); setError("");
    try {
      await submitLead({
        full_name: name.trim(),
        phone: phone.trim(),
        message: `Deal alerts: ${categories.join(", ")}${city ? ` in ${city}` : ""}`,
        lead_type: "info_request",
        source: "deals_page",
      });
      // Send confirmation SMS
      await fetch(`${IDX_API}/api/idx/send-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(), phone: phone.trim(), channel: "sms",
          tool: "deal_alerts",
          results: `You're signed up for Deal Alerts! Looking for: ${categories.join(", ")}${city ? ` in ${city}` : ""}. We'll text you when new deals match. Reply STOP to opt out. - Garden State AI`,
        }),
      }).catch(() => {});
      setStep("done");
    } catch {
      setError("Could not save. Please try again.");
    }
    setSaving(false);
  }

  const inputCls = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500";

  if (step === "done") {
    return (
      <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-lg border">
        <div className="text-4xl mb-3">{"\u2705"}</div>
        <h3 className="text-xl font-bold text-gray-800">You&apos;re all set, {name.split(" ")[0]}!</h3>
        <p className="text-gray-600 mt-3">Looking for: <strong>{categories.join(", ")}</strong>{city ? ` in ${city}` : ""}</p>
        <p className="text-gray-600 mt-2">We&apos;ve sent a confirmation to your phone. We&apos;ll text you when new deals match your criteria.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg border">
      <h3 className="text-xl font-bold text-gray-800">Get Deal Alerts</h3>
      <p className="text-gray-500 text-sm mt-1">We&apos;ll notify you when new deals match your criteria.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What types of properties are you looking for? *</label>
          <div className="flex flex-wrap gap-2">
            {DEAL_CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => toggleCat(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${categories.includes(cat) ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Preferred city (optional)" className={inputCls} />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputCls} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" type="tel" className={inputCls} />
        <SmsConsent checked={consent} onChange={setConsent} />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button onClick={handleSubmit} disabled={saving} className="mt-4 w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 transition disabled:opacity-40">
        {saving ? "Saving..." : "Get Deal Alerts"}
      </button>
    </div>
  );
}
