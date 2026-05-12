"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const suggestions = [
  "3 bedroom houses in Hoboken under 500k",
  "What's my home worth?",
  "Show me deals in Bergen County",
  "Condos near NYC with 2+ baths",
  "Find me a house with a pool in Morris County",
];

export default function HeroChat() {
  const [query, setQuery] = useState("");
  const [typing, setTyping] = useState(false);
  const router = useRouter();

  function handleSubmit(text?: string) {
    const q = (text || query).trim();
    if (!q) return;

    // Route to search or sell based on intent
    if (/worth|value|valuation|sell|vender|cma/i.test(q)) {
      router.push("/sell");
    } else if (/deal|bargain|price drop|under market/i.test(q)) {
      router.push("/deals");
    } else {
      // Extract search params from natural language
      const cityMatch = q.match(/in\s+([A-Za-z\s]+?)(?:\s+under|\s+with|\s+near|$)/i);
      const priceMatch = q.match(/under\s+\$?([\d,]+)\s*(k|m)?/i);
      const bedMatch = q.match(/(\d)\s*(?:bed|br|bedroom)/i);

      const params = new URLSearchParams();
      if (cityMatch) params.set("city", cityMatch[1].trim());
      if (priceMatch) {
        let price = parseInt(priceMatch[1].replace(/,/g, ""));
        if (priceMatch[2]?.toLowerCase() === "k") price *= 1000;
        if (priceMatch[2]?.toLowerCase() === "m") price *= 1000000;
        params.set("maxPrice", String(price));
      }
      if (bedMatch) params.set("beds", bedMatch[1]);
      params.set("q", q);

      router.push(`/search?${params.toString()}`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Main input */}
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
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
          placeholder="Ask Vale anything... &quot;3 bed house in Hoboken under 500k&quot;"
          className="flex-1 px-4 py-5 text-base text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          onClick={() => handleSubmit()}
          className="bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Search
        </button>
      </div>

      {/* Smart suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => { setQuery(s); handleSubmit(s); }}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
