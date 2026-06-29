"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { submitLead } from "@/lib/api";
import SmsConsent from "./SmsConsent";

const STORAGE_KEY = "gsai_proactive_shown";

/** Context-aware proactive nudge — adapts message to current page. */
function getNudge(pathname: string): { title: string; body: string; cta: string; interest: string } {
  if (pathname.startsWith("/market/")) {
    const city = decodeURIComponent(pathname.split("/market/")[1] || "");
    return {
      title: `Interested in ${city || "this market"}?`,
      body: "Get weekly price alerts and new listings in this area — before they hit the market.",
      cta: "Get Market Alerts",
      interest: `market alerts: ${city}`,
    };
  }
  if (pathname === "/sell" || pathname.startsWith("/sell")) {
    return {
      title: "Thinking about selling?",
      body: "Get a free AI-powered valuation and our 90-day guarantee: if we don't sell it, we do it for free.",
      cta: "Get My Valuation",
      interest: "sell",
    };
  }
  if (pathname === "/search" || pathname.startsWith("/property/")) {
    return {
      title: "Found something you like?",
      body: "Save your search and get instant alerts when similar homes hit the market or drop in price.",
      cta: "Set Up Alerts",
      interest: "buy",
    };
  }
  if (pathname === "/property-tax") {
    return {
      title: "Paying too much in taxes?",
      body: "Enter your address above — or let me check if you qualify for a property tax reduction.",
      cta: "Check My Taxes",
      interest: "tax appeal",
    };
  }
  return {
    title: "Can I help?",
    body: "I'm Vale — I can find homes, estimate values, or analyze any NJ market. What are you looking for?",
    cta: "Let's Talk",
    interest: "general",
  };
}

export default function ProactiveVale() {
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [consent, setConsent] = useState(false);
  const pathname = usePathname();
  const nudge = getNudge(pathname);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    // Don't show on chat or property detail pages (user is already engaged with Vale)
    if (pathname === "/chat" || pathname.startsWith("/property/")) return;

    const timer = setTimeout(() => {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }
    }, 30000); // 30 seconds
    return () => clearTimeout(timer);
  }, [pathname]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    if (!consent) return;
    try {
      await submitLead({
        full_name: "Proactive Lead",
        phone: phone.trim(),
        message: `Proactive nudge lead — interest: ${nudge.interest}. Page: ${pathname}`,
        lead_type: nudge.interest === "buy" ? "buyer_waitlist" : "info_request",
      });
    } catch { /* silent */ }
    setSubmitted(true);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-24 right-5 z-50 max-w-xs animate-[slideUp_0.3s_ease-out] rounded-xl bg-white p-4 shadow-2xl border border-gold/30">
      <button onClick={() => setShow(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm">&#10005;</button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy">
          <svg viewBox="0 0 200 200" className="h-6 w-6">
            <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
            <circle cx="100" cy="105" r="52" fill="#4f46e5" />
            <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
          </svg>
        </div>
        <div className="min-w-0">
          {submitted ? (
            <>
              <p className="text-sm font-semibold text-green-700">Got it!</p>
              <p className="mt-1 text-xs text-gray-500">We&apos;ll be in touch soon.</p>
            </>
          ) : showForm ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Your phone or WhatsApp" required autoFocus
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-gold focus:outline-none" />
              <SmsConsent checked={consent} onChange={setConsent} />
              <button type="submit" disabled={!phone.trim() || !consent}
                className="w-full rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-navy hover:bg-yellow-400 disabled:opacity-40">
                {nudge.cta}
              </button>
            </form>
          ) : (
            <>
              <p className="text-sm font-semibold text-navy">{nudge.title}</p>
              <p className="mt-1 text-xs text-gray-500">{nudge.body}</p>
              <button onClick={() => setShowForm(true)}
                className="mt-2 rounded-lg bg-gold px-4 py-1.5 text-xs font-bold text-navy hover:bg-yellow-400">
                {nudge.cta}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
