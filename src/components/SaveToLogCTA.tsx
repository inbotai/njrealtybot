"use client";

import { useState } from "react";
import SmsConsent from "./SmsConsent";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface SaveToLogCTAProps {
  toolType: "cma" | "tax_appeal" | "sell_timing" | "renovation";
  address?: string;
  city?: string;
  data?: Record<string, unknown>;
  /** Headline override — defaults per tool type */
  headline?: string;
}

const DEFAULT_HEADLINES: Record<string, string> = {
  cma: "Save this valuation to your MyHome Log",
  tax_appeal: "Save this tax analysis to your MyHome Log",
  sell_timing: "Save this timing analysis to your MyHome Log",
  renovation: "Save this renovation to your MyHome Log",
};

const BENEFITS = [
  "Track your home's value over time",
  "Never lose a tax analysis or valuation",
  "Get monthly updates on your home's market",
  "Build a verified history for when you sell",
];

export default function SaveToLogCTA({
  toolType,
  address,
  city,
  data,
  headline,
}: SaveToLogCTAProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || saving || !consent) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/auto-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          full_name: name.trim() || undefined,
          address,
          city,
          tool_type: toolType,
          data,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save");
      }

      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
    setSaving(false);
  }

  if (saved) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mt-3 font-bold text-emerald-800">Saved to your MyHome Log</h3>
        <p className="mt-1 text-sm text-emerald-600">
          You'll receive a monthly update on your home's value and market activity.
        </p>
        <a
          href="/my-home/log"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          View your MyHome Log
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left — benefits */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-navy">
            {headline || DEFAULT_HEADLINES[toolType]}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Enter your phone to create your free MyHome Log. Every valuation, tax analysis, and improvement — in one place, forever.
          </p>
          <ul className="mt-3 space-y-1.5">
            {BENEFITS.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <form onSubmit={handleSave} className="w-full md:w-72 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone or WhatsApp number"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <SmsConsent checked={consent} onChange={setConsent} />
          <button
            type="submit"
            disabled={!phone.trim() || saving || !consent}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save to My Log — Free"}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-[10px] text-gray-400 text-center">
            No credit card. Your data stays yours.
          </p>
        </form>
      </div>
    </div>
  );
}
