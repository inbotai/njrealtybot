"use client";

import { useState } from "react";

const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";

interface LeadGateProps {
  /** What the user gets after submitting (shown in button) */
  valueProp: string;
  /** Source tag for tracking (e.g. "sell_score", "affordability", "deals") */
  source: string;
  /** Message to save with the lead (what they were looking at) */
  message: string;
  /** Lead type */
  leadType?: string;
  /** Called after successful submission */
  onCaptured?: () => void;
  /** Optional: show as inline form instead of modal */
  inline?: boolean;
  /** Optional: custom title */
  title?: string;
}

export default function LeadGate({
  valueProp, source, message, leadType = "info_request",
  onCaptured, inline = false, title,
}: LeadGateProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    try {
      await fetch(`${IDX_API}/api/idx/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(),
          phone: phone.trim(),
          message,
          lead_type: leadType,
          source,
        }),
      });
    } catch { /* best effort */ }
    setSubmitted(true);
    setLoading(false);
    onCaptured?.();
  }

  if (submitted) {
    return (
      <div className={`rounded-2xl ${inline ? "bg-emerald-50 border border-emerald-200" : "bg-emerald-900/30 border border-emerald-500/30"} p-6 text-center`}>
        <p className={`text-xl font-bold ${inline ? "text-emerald-700" : "text-emerald-400"}`}>Got it, {name.split(" ")[0]}!</p>
        <p className={`mt-2 text-sm ${inline ? "text-emerald-600" : "text-gray-300"}`}>
          We&apos;ll send your full report to {phone}. Check your WhatsApp!
        </p>
      </div>
    );
  }

  const inputCls = inline
    ? "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500"
    : "w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-gold";

  const btnCls = inline
    ? "w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 transition disabled:opacity-40"
    : "w-full rounded-xl bg-gold py-3 font-bold text-navy hover:bg-yellow-400 transition disabled:opacity-40";

  return (
    <form onSubmit={handleSubmit}
      className={`rounded-2xl ${inline ? "bg-white border border-gray-200 shadow-lg" : "bg-white/5 border border-white/10"} p-6 space-y-3`}>
      <h3 className={`font-bold text-lg ${inline ? "text-gray-900" : "text-white"}`}>
        {title || valueProp}
      </h3>
      <p className={`text-sm ${inline ? "text-gray-500" : "text-gray-400"}`}>
        Enter your info and we&apos;ll send it to your phone.
      </p>
      <input
        type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Your name" className={inputCls} required
      />
      <input
        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
        placeholder="Phone / WhatsApp number" className={inputCls} required
      />
      <button type="submit" disabled={!name.trim() || !phone.trim() || loading} className={btnCls}>
        {loading ? "Sending..." : valueProp}
      </button>
      <p className={`text-[10px] text-center ${inline ? "text-gray-400" : "text-gray-600"}`}>
        No spam, ever. We&apos;ll only text about this request.
      </p>
    </form>
  );
}
