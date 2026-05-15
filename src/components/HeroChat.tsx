"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVale } from "./ValeProvider";
import VoiceButton from "./VoiceButton";

const suggestions = [
  { label: "Houses in Hoboken", params: "city=Hoboken" },
  { label: "Condos under 400k", params: "maxPrice=400000&propertyType=condo" },
  { label: "3 bed in Jersey City", params: "city=Jersey+City&beds=3" },
  { label: "What's my home worth?", href: "/sell" },
  { label: "Find deals", href: "/deals" },
];

export default function HeroChat() {
  const [input, setInput] = useState("");
  const router = useRouter();
  const { send, openPanel } = useVale();

  function handleSearch(text?: string) {
    const q = (text || input).trim();
    if (!q) return;
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

    // Parse natural language into search params
    const params = new URLSearchParams();

    // City extraction
    // 1. Try "in/en/near [city]"
    const cityPrep = q.match(/(?:in|en|near|cerca de)\s+([A-Za-z][A-Za-z\s]*?)(?:\s+(?:under|with|below|con|menos|that|for|under)|$)/i);
    if (cityPrep) {
      params.set("city", cityPrep[1].trim());
    } else {
      // 2. Fallback: find remaining words after removing known terms
      const remaining = q.toLowerCase()
        .replace(/\d+\s*(?:bed|br|bedroom|bath|ba|baño|dormitorio|habitaci)\w*/gi, "")
        .replace(/(?:under|below|over|above|menos de|max)\s*\$?[\d,.]+\s*[km]?/gi, "")
        .replace(/\$[\d,.]+[km]?/gi, "")
        .replace(/\b(show|find|search|me|houses?|homes?|condos?|townhouse|apartment|property|properties|looking|for|with|the|and|busco|quiero|casa|casas|una|un|los|las|del|que|tiene|garage|pool|patio)\b/gi, "")
        .trim();
      if (remaining.length > 2) {
        // Take the longest remaining word group as city
        const cityGuess = remaining.replace(/\s+/g, " ").trim();
        if (cityGuess) params.set("city", cityGuess);
      }
    }

    // Price
    const underPrice = q.match(/(?:under|below|menos de|max|up to)\s*\$?([\d,.]+)\s*(k|m)?/i);
    if (underPrice) {
      let price = parseFloat(underPrice[1].replace(/,/g, ""));
      if (underPrice[2]?.toLowerCase() === "k") price *= 1000;
      if (underPrice[2]?.toLowerCase() === "m") price *= 1000000;
      params.set("maxPrice", String(price));
    }

    // Beds
    const bedMatch = q.match(/(\d)\+?\s*(?:bed|br|bedroom|dormitorio|habitaci)/i);
    if (bedMatch) params.set("beds", bedMatch[1]);

    // Baths
    const bathMatch = q.match(/(\d)\+?\s*(?:bath|ba|baño)/i);
    if (bathMatch) params.set("baths", bathMatch[1]);

    // Listing type (sale vs rent vs commercial vs land)
    if (/\brent(al|s|ing)?\b|\bfor rent\b|\balquil/i.test(q)) params.set("propertyType", "Rental");
    else if (/\bcommercial\b|\boffice\s*space\b|\boficina/i.test(q)) params.set("propertyType", "Commercial");
    else if (/\bland\b|\blot\b|\bterreno/i.test(q)) params.set("propertyType", "Land");
    else if (/\bmulti.?fam/i.test(q)) params.set("propertyType", "Multi-Family");

    // Always pass the original query for Vale context
    params.set("q", q);

    // Navigate to search page
    router.push(`/search?${params.toString()}`);

    // Open Vale with context
    openPanel();
    send(q);
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
          disabled={!input.trim()}
          className="bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          Search
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
