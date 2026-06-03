"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IDX_PUBLIC_ENABLED } from "@/lib/config";

const STORAGE_KEY = "gsai_exit_shown";

/** Exit intent popup — shows when mouse leaves viewport. Once per session. Hidden until broker. */
export default function ExitIntent() {
  const [show, setShow] = useState(false);
  const [address, setAddress] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Hidden until IDX/broker is ready
    if (!IDX_PUBLIC_ENABLED) return;
    // Only once per session
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !sessionStorage.getItem(STORAGE_KEY)) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }
    }
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setShow(false);
    router.push(`/chat?q=${encodeURIComponent(`What's my home worth? ${address}`)}`);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4" onClick={() => setShow(false)}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&#10005;</button>
        <h2 className="text-2xl font-extrabold text-navy">Wait — before you go!</h2>
        <p className="mt-2 text-sm text-gray-600">Get a free AI-powered home valuation in 30 seconds. No obligation.</p>
        <form onSubmit={handleSubmit} className="mt-4">
          <input type="text" value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Enter your address (e.g. 36 Clark Ave, Bloomfield)"
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
          <button type="submit" disabled={!address.trim()}
            className="mt-3 w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40">
            Get My Free Estimate
          </button>
        </form>
        <p className="mt-3 text-xs text-gray-400 text-center">Powered by Garden State AI</p>
      </div>
    </div>
  );
}
