"use client";

import { useState } from "react";
import { submitLead } from "@/lib/api";

export default function OpenHouseAlerts() {
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim() || !phone.trim() || loading) return;
    setLoading(true);
    try {
      await submitLead({
        full_name: "Open House Alert",
        phone: phone.trim(),
        message: `Open house alerts for ${city.trim()}`,
        lead_type: "info_request",
      });
      setSent(true);
    } catch { /* fail silently */ }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-navy">Get Open House Alerts</h3>
      <p className="mt-1 text-xs text-gray-500">Be the first to know about open houses in your area</p>
      {sent ? (
        <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3 text-center">
          <p className="text-sm font-medium text-green-800">You&apos;re subscribed!</p>
          <p className="text-xs text-green-600">We&apos;ll notify you about open houses in {city}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <input type="text" value={city} onChange={e => setCity(e.target.value)}
            placeholder="City (e.g. Hoboken)" required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Your phone or WhatsApp" required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" />
            <span className="text-[10px] text-gray-500 leading-relaxed">
              I consent to receive SMS/WhatsApp messages about open houses.
              Msg &amp; data rates may apply. Reply STOP to opt out.{" "}
              <a href="/privacy" target="_blank" className="underline hover:text-gray-700">Privacy</a>
              {" & "}
              <a href="/terms" target="_blank" className="underline hover:text-gray-700">Terms</a>.
            </span>
          </label>
          <button type="submit" disabled={loading || !city.trim() || !phone.trim()}
            className="w-full rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-40">
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}
