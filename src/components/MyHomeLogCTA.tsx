"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const EXCLUDED_PATHS = ["/my-home", "/admin", "/privacy", "/terms", "/v2", "/chat", "/open-house"];

export default function MyHomeLogCTA() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true); // start hidden, show after check
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show on excluded pages
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;
    // Don't show if user dismissed recently (24hr cooldown)
    const dismissedAt = localStorage.getItem("myhome_cta_dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 86400000) return;
    // Show after 3 seconds on page
    const timer = setTimeout(() => {
      setDismissed(false);
      setTimeout(() => setVisible(true), 50); // trigger animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [pathname]);

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => setDismissed(true), 300);
    localStorage.setItem("myhome_cta_dismissed", String(Date.now()));
  }

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-30 mx-auto max-w-lg transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-2xl">
        {/* Gradient accent bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-gold" />

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-navy">
                Track Your Home Improvements
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                Log repairs, upgrades &amp; maintenance. Know your ROI. Sell smarter when the time comes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/my-home/log"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-sm"
                >
                  Start My Home Log
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 py-2">
                  <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                  Free forever
                </span>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-lg p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
