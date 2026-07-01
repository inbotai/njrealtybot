"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const EXCLUDED_PATHS = ["/my-home", "/admin", "/privacy", "/terms", "/v2", "/chat", "/open-house"];

export default function MyHomeLogCTA() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;
    if (pathname === "/") return; // homepage has its own large CTA section
    const dismissedAt = localStorage.getItem("myhome_cta_dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 86400000) return;
    setDismissed(false);
  }, [pathname]);

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem("myhome_cta_dismissed", String(Date.now()));
  }

  if (dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:inline text-xl">🏠</span>
            <p className="text-sm text-white truncate">
              <span className="font-bold">MyHome Log</span>
              <span className="hidden sm:inline"> — Track improvements, know your ROI, sell smarter.</span>
              <span className="sm:hidden"> — Track your home&apos;s value.</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/my-home/log"
              className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition shadow-sm"
            >
              Start Free
            </Link>
            <button
              onClick={handleDismiss}
              className="rounded p-1 text-indigo-200 hover:text-white transition"
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
