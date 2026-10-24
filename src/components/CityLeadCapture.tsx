"use client";

import { useState } from "react";
import { submitLead } from "@/lib/api";
import SmsConsent from "./SmsConsent";

type Intent = "alerts" | "sell";

function LeadCard({
  city,
  intent,
  title,
  body,
  source,
}: {
  city: string;
  intent: Intent;
  title: string;
  body: string;
  source: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !consent) return;
    setLoading(true);
    setError("");
    try {
      await submitLead({
        full_name: name.trim() || (intent === "sell" ? "Seller Valuation Lead" : "Buyer Alert Lead"),
        phone: phone.trim(),
        message: `${title} — ${city}. Source: ${source}.`,
        lead_type: intent === "sell" ? "listing_request" : "buyer_waitlist",
        source,
      });
      setDone(true);
    } catch {
      setError("We couldn't save that just now. Call (201) 528-1095 or try again.");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-navy">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
      {done ? (
        <p className="mt-4 text-sm font-semibold text-emerald-700">You're on the list. We'll follow up about {city}.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <SmsConsent checked={consent} onChange={setConsent} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !consent}
            className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "Sending..." : intent === "sell" ? "Get My 2026 Valuation" : "Get Instant Alerts"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function CityLeadCapture({ city, source }: { city: string; source: string }) {
  return (
    <section className="border-y bg-gray-50 py-10">
      <div className="mx-auto grid max-w-5xl gap-4 px-4 md:grid-cols-2">
        <LeadCard
          city={city}
          intent="alerts"
          source={source}
          title={`Get Instant Price-Drop & New Listing Alerts in ${city}`}
          body={`Tell us when a ${city} home hits the market or drops in price. Free buyer alerts.`}
        />
        <LeadCard
          city={city}
          intent="sell"
          source={source}
          title={`What's Your ${city} Home Worth in 2026?`}
          body={`Get a seller valuation for your ${city} home using recent sales and local tax data.`}
        />
      </div>
    </section>
  );
}
