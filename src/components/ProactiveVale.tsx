"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IDX_PUBLIC_ENABLED } from "@/lib/config";

const STORAGE_KEY = "gsai_proactive_shown";

/** Proactive Vale nudge — appears after 15s on homepage. Hidden until broker. */
export default function ProactiveVale() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!IDX_PUBLIC_ENABLED) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

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
        <div>
          <p className="text-sm font-semibold text-navy">Looking to sell?</p>
          <p className="mt-1 text-xs text-gray-500">I can tell you what your home is worth in 30 seconds. Just type your address.</p>
          <button onClick={() => { setShow(false); router.push("/chat?q=What%27s%20my%20home%20worth%3F"); }}
            className="mt-2 rounded-lg bg-gold px-4 py-1.5 text-xs font-bold text-navy hover:bg-yellow-400">
            Get My Valuation
          </button>
        </div>
      </div>
    </div>
  );
}
