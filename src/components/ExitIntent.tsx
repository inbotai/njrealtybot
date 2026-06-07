"use client";

import { useState, useEffect } from "react";
import { submitLead } from "@/lib/api";

const STORAGE_KEY = "gsai_exit_shown";

/** Exit intent popup — captures lead with value exchange. Once per session. */
export default function ExitIntent() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState<"buy" | "sell" | "invest" | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    // Delay enabling exit intent — don't show to bouncing users
    let enabled = false;
    const enableTimer = setTimeout(() => { enabled = true; }, 10000);

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0 && enabled && !sessionStorage.getItem(STORAGE_KEY)) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }
    }
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      clearTimeout(enableTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      await submitLead({
        full_name: name.trim() || "Exit Intent Lead",
        phone: phone.trim(),
        message: `Exit intent lead — interest: ${interest || "not specified"}. Captured from ${window.location.pathname}`,
        lead_type: interest === "buy" ? "buyer_waitlist" : "info_request",
      });
    } catch { /* still show success */ }
    setSubmitted(true);
    setLoading(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4" onClick={() => setShow(false)}>
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&#10005;</button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl">&#10003;</div>
            <h2 className="mt-2 text-xl font-bold text-navy">You&apos;re on the list!</h2>
            <p className="mt-2 text-sm text-gray-600">
              {interest === "sell" && "We'll send you a free home valuation within 24 hours."}
              {interest === "buy" && "We'll notify you of matching properties in your area."}
              {interest === "invest" && "We'll send you our latest NJ investment opportunities."}
              {!interest && "A Garden State AI specialist will reach out shortly."}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-navy">Before you go...</h2>
            <p className="mt-2 text-sm text-gray-600">
              Get free NJ real estate insights delivered to you — market alerts, price drops, investment opportunities.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              {/* Interest selector */}
              <div className="flex gap-2">
                {([
                  { key: "sell", label: "Selling", emoji: "&#127968;" },
                  { key: "buy", label: "Buying", emoji: "&#128269;" },
                  { key: "invest", label: "Investing", emoji: "&#128200;" },
                ] as const).map(opt => (
                  <button key={opt.key} type="button"
                    onClick={() => setInterest(opt.key)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${
                      interest === opt.key
                        ? "border-gold bg-gold/10 text-navy"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                    dangerouslySetInnerHTML={{ __html: `${opt.emoji} ${opt.label}` }}
                  />
                ))}
              </div>

              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Phone or WhatsApp" required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              <button type="submit" disabled={loading || !phone.trim()}
                className="w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40">
                {loading ? "..." : interest === "sell" ? "Get My Free Valuation" : interest === "invest" ? "Send Me Deals" : "Keep Me Updated"}
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-400 text-center">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </div>
  );
}
