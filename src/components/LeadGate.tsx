"use client";

import { useState } from "react";

const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";

interface LeadGateProps {
  /** Button label — what user gets (e.g. "Send My Results via WhatsApp") */
  valueProp: string;
  /** Source tag for tracking (e.g. "sell_score", "affordability") */
  source: string;
  /** Message to save with the lead (context of what they viewed) */
  message: string;
  /** Formatted results text to send via WhatsApp/SMS */
  resultsText?: string;
  /** Called after successful submission */
  onCaptured?: () => void;
  /** Light-background inline mode */
  inline?: boolean;
  /** Custom title above the form */
  title?: string;
}

export default function LeadGate({
  valueProp, source, message, resultsText,
  onCaptured, inline = false, title,
}: LeadGateProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    try {
      if (resultsText) {
        // Send results via WhatsApp/SMS + capture lead in one call
        await fetch(`${IDX_API}/api/idx/send-results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: name.trim(),
            phone: phone.trim(),
            channel,
            tool: source,
            results: resultsText,
          }),
        });
      } else {
        // Just capture lead (no results to send)
        await fetch(`${IDX_API}/api/idx/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: name.trim(),
            phone: phone.trim(),
            message,
            lead_type: "info_request",
            source,
          }),
        });
      }
    } catch { /* best effort */ }
    setSubmitted(true);
    setLoading(false);
    onCaptured?.();
  }

  if (submitted) {
    return (
      <div className={`rounded-2xl ${inline ? "bg-emerald-50 border border-emerald-200" : "bg-emerald-900/30 border border-emerald-500/30"} p-6 text-center`}>
        <p className={`text-xl font-bold ${inline ? "text-emerald-700" : "text-emerald-400"}`}>
          Sent, {name.split(" ")[0]}!
        </p>
        <p className={`mt-2 text-sm ${inline ? "text-emerald-600" : "text-gray-300"}`}>
          {resultsText
            ? `Check your ${channel === "sms" ? "text messages" : "WhatsApp"} — your results are on the way.`
            : `We'll reach out to ${phone} shortly.`}
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

  const dark = !inline;

  return (
    <form onSubmit={handleSubmit}
      className={`rounded-2xl ${inline ? "bg-white border border-gray-200 shadow-lg" : "bg-white/5 border border-white/10"} p-6 space-y-3`}>
      <h3 className={`font-bold text-lg ${dark ? "text-white" : "text-gray-900"}`}>
        {title || (resultsText ? "Send My Results" : valueProp)}
      </h3>
      <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
        {resultsText
          ? "Enter your info and we'll send your results instantly."
          : "Enter your info and we'll follow up."}
      </p>
      <input
        type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Your name" className={inputCls} required
      />
      <input
        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
        placeholder="Phone / WhatsApp number" className={inputCls} required
      />

      {/* Channel selector — only show when sending results */}
      {resultsText && (
        <div className="flex gap-2">
          <button type="button" onClick={() => setChannel("whatsapp")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              channel === "whatsapp"
                ? "bg-[#25D366] text-white"
                : dark ? "bg-white/10 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}>
            WhatsApp
          </button>
          <button type="button" onClick={() => setChannel("sms")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              channel === "sms"
                ? "bg-blue-600 text-white"
                : dark ? "bg-white/10 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}>
            Text / SMS
          </button>
        </div>
      )}

      <button type="submit" disabled={!name.trim() || !phone.trim() || loading} className={btnCls}>
        {loading ? "Sending..." : resultsText ? `Send via ${channel === "sms" ? "SMS" : "WhatsApp"}` : valueProp}
      </button>
      <p className={`text-[10px] text-center ${dark ? "text-gray-600" : "text-gray-400"}`}>
        No spam, ever. We&apos;ll only send what you requested.
      </p>
    </form>
  );
}
