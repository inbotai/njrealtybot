"use client";

import { useState } from "react";
import { submitLead } from "@/lib/api";

export default function MarketLeadCapture({ city }: { city: string }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState<"alerts" | "invest" | "sell">("alerts");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      await submitLead({
        full_name: name.trim() || "Market Alert Lead",
        phone: phone.trim(),
        message: `Market lead — ${city}. Interest: ${interest}. Wants ${
          interest === "alerts" ? "price alerts & new listings"
            : interest === "invest" ? "investment opportunities"
              : "home valuation to sell"
        }.`,
        lead_type: interest === "sell" ? "listing_request" : "buyer_waitlist",
      });
    } catch { /* still show success */ }
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <section className="border-y bg-green-50 py-8">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-lg font-bold text-green-800">You&apos;re set!</p>
          <p className="mt-1 text-sm text-green-700">
            {interest === "alerts" && `We'll send you updates when homes in ${city} hit the market or change in price.`}
            {interest === "invest" && `We'll send you investment opportunities in ${city} as they come up.`}
            {interest === "sell" && `We'll send you a free valuation for your ${city} home within 24 hours.`}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y bg-gradient-to-r from-gold/5 via-white to-gold/5 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <h3 className="text-center text-lg font-bold text-navy">
          Stay Ahead of the {city} Market
        </h3>
        <p className="mt-1 text-center text-sm text-gray-600">
          Get instant alerts — new listings, price drops, and sold comps in {city}.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          {/* Interest tabs */}
          <div className="flex gap-2 justify-center mb-4">
            {([
              { key: "alerts", label: "Market Alerts" },
              { key: "invest", label: "Investment Deals" },
              { key: "sell", label: "Sell My Home" },
            ] as const).map(opt => (
              <button key={opt.key} type="button"
                onClick={() => setInterest(opt.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  interest === opt.key
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gold focus:outline-none" />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="Phone or WhatsApp" required
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gold focus:outline-none" />
            <button type="submit" disabled={loading || !phone.trim()}
              className="whitespace-nowrap rounded-lg bg-gold px-6 py-2.5 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40">
              {loading ? "..." : "Sign Up Free"}
            </button>
          </div>
          <label className="mt-2 flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" />
            <span className="text-[10px] text-gray-500 leading-relaxed">
              I consent to receive SMS/WhatsApp messages from Garden State AI
              about market updates and real estate services.
              Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out.
              Your mobile info will not be shared with third parties.{" "}
              <a href="/privacy" target="_blank" className="underline hover:text-gray-700">Privacy Policy</a>
              {" & "}
              <a href="/terms" target="_blank" className="underline hover:text-gray-700">Terms</a>.
            </span>
          </label>
        </form>
      </div>
    </section>
  );
}
