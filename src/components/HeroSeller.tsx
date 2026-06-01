"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VoiceButton from "./VoiceButton";

const chips: { label: string; query?: string; href?: string }[] = [
  { label: "What's my home worth?", query: "What's my home worth?" },
  { label: "Market report for my area", query: "Market analysis for my city" },
  { label: "Sell my home", href: "/sell" },
];

export default function HeroSeller() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function submit(text?: string) {
    const q = (text || address).trim();
    if (!q || loading) return;
    setLoading(true);
    router.push(`/chat?q=${encodeURIComponent(`What's my home worth? ${q}`)}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Address input */}
      <div className="flex overflow-hidden rounded-xl bg-white shadow-2xl">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Enter your NJ address (e.g. 36 Clark Ave, Bloomfield)"
          className="flex-1 px-5 py-5 text-base text-gray-800 outline-none placeholder:text-gray-400"
        />
        <VoiceButton
          onTranscript={(text) => { setAddress(text); submit(text); }}
          className="px-2"
        />
        <button
          onClick={() => submit()}
          disabled={!address.trim() || loading}
          className="bg-gold px-6 text-sm font-bold text-navy transition hover:bg-yellow-400 disabled:opacity-40"
        >
          {loading ? "..." : "Get Free Estimate"}
        </button>
      </div>
      <p className="mt-3 text-sm text-gray-400">
        Or click the microphone and say your address
      </p>

      {/* Chips */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={() => {
              if (c.href) router.push(c.href);
              else if (c.query) router.push(`/chat?q=${encodeURIComponent(c.query)}`);
            }}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
