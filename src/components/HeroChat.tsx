"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVale } from "./ValeProvider";
import { parseSearchQuery } from "@/lib/api";
import VoiceButton from "./VoiceButton";

const suggestions = [
  { label: "Houses in Hoboken", params: "city=Hoboken" },
  { label: "Rentals in Jersey City", params: "city=Jersey+City&propertyType=Rental" },
  { label: "3 bed in Jersey City", params: "city=Jersey+City&beds=3" },
  { label: "What's my home worth?", href: "/sell" },
  { label: "Find deals", href: "/deals" },
];

export default function HeroChat() {
  const [input, setInput] = useState("");
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const { send, openPanel } = useVale();

  async function handleSearch(text?: string) {
    const q = (text || input).trim();
    if (!q || searching) return;
    setInput("");

    // Route to special pages
    if (/worth|value|valuation|sell|vender|cma|cuanto vale/i.test(q)) {
      router.push("/sell");
      return;
    }
    if (/deal|bargain|price drop|ganga|oportunidad/i.test(q)) {
      router.push("/deals");
      return;
    }

    // AI parses the query into structured search params
    setSearching(true);
    const parsed = await parseSearchQuery(q);
    setSearching(false);

    const params = new URLSearchParams();
    if (parsed.city) params.set("city", parsed.city);
    if (parsed.county) params.set("county", parsed.county);
    if (parsed.beds) params.set("beds", String(parsed.beds));
    if (parsed.baths) params.set("baths", String(parsed.baths));
    if (parsed.minPrice) params.set("minPrice", String(parsed.minPrice));
    if (parsed.maxPrice) params.set("maxPrice", String(parsed.maxPrice));
    if (parsed.propertyType) params.set("propertyType", parsed.propertyType);
    if (parsed.q) params.set("q", parsed.q);

    // Navigate to search page
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Search input */}
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
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          placeholder='Ask Vale... "3 bed house in Hoboken under 500k"'
          className="flex-1 px-4 py-5 text-base text-gray-800 outline-none placeholder:text-gray-400"
        />
        <VoiceButton
          onTranscript={(text) => { setInput(text); handleSearch(text); }}
          className="px-2"
        />
        <button
          onClick={() => handleSearch()}
          disabled={!input.trim() || searching}
          className="bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestions.map(s => (
          <button
            key={s.label}
            onClick={() => {
              if (s.href) {
                router.push(s.href);
              } else {
                router.push(`/search?${s.params}`);
                openPanel();
              }
            }}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
