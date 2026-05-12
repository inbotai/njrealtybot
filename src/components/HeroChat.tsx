"use client";

import { useState } from "react";
import { useVale } from "./ValeProvider";
import { getPhotoUrl, type Listing } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";
import Link from "next/link";

const suggestions = [
  "3 bedroom houses in Hoboken under 500k",
  "What's my home worth?",
  "Show me deals in Bergen County",
  "Condos near NYC with 2+ baths",
  "Find me a house with a pool",
];

export default function HeroChat() {
  const { send, openPanel, listings, panelOpen, messages } = useVale();
  const [input, setInput] = useState("");
  const hasConversation = messages.length > 0;

  function handleSend(text?: string) {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    openPanel();
    send(q);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Input bar */}
      <div className="flex overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center pl-4">
          <svg viewBox="0 0 200 200" className="h-8 w-8 flex-shrink-0">
            <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
            <circle cx="100" cy="105" r="52" fill="#4f46e5" />
            <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
            <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder='Ask Vale anything... "3 bed house in Hoboken under 500k"'
          className="flex-1 px-4 py-5 text-base text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          Ask Vale
        </button>
      </div>

      {/* Suggestions */}
      {!hasConversation && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Listing cards from Vale's response — show in hero area */}
      {listings.length > 0 && !panelOpen && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 6).map(l => (
            <Link key={l.id} href={`/property/${generateSlug(l)}`}
              className="flex gap-3 rounded-xl bg-white p-3 shadow-md transition hover:shadow-lg"
            >
              {l.photo_count > 0 && (
                <img src={getPhotoUrl(l.mls_number)} alt={formatAddress(l)}
                  className="h-20 w-24 flex-shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy">
                  {l.list_price ? formatPrice(l.list_price) : "Price TBD"}
                </p>
                <p className="truncate text-xs text-gray-600">{formatAddress(l)}</p>
                {l.city && <p className="text-[10px] text-gray-400">{l.city}, NJ</p>}
                <p className="mt-1 text-[10px] text-gray-500">
                  {l.bedrooms_total ?? "?"} bed / {l.bathrooms_total ?? "?"} bath
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
