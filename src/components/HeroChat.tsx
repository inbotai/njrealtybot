"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVale } from "./ValeProvider";
import { parseSearchQuery } from "@/lib/api";
import { IDX_SUBDOMAIN } from "@/lib/config";
import VoiceButton from "./VoiceButton";

const suggestions = [
  { label: "Houses in Hoboken", params: "city=Hoboken" },
  { label: "Rentals in Jersey City", params: "city=Jersey+City&propertyType=Rental" },
  { label: "3 bed in Bergen County", params: "county=Bergen&beds=3" },
  { label: "Multi-Family in Passaic", params: "county=Passaic&propertyType=Multi-Family" },
  { label: "Under $400K in Essex", params: "county=Essex&maxPrice=400000" },
];

export default function HeroChat() {
  const [input, setInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const router = useRouter();
  const { send, openPanel } = useVale();

  async function handleSearch(text?: string) {
    const q = (text || input).trim();
    if (!q || searching) return;
    setInput("");

    // Normalize accents for matching: análisis → analisis
    const qNorm = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // CMA / valuation → /sell page
    if (/worth|value|valuaci|cma|cuanto vale|market analysis|analisis de mercado|how much.*worth/i.test(qNorm)) {
      router.push("/sell");
      return;
    }

    // Tax queries → /tax-shock or /appeal
    if (/tax|taxes|impuesto|assessment|overpay|sobre.?tasado|appeal|chapter 123/i.test(qNorm)) {
      if (/appeal|apelar|form.a-1|chapter 123/i.test(qNorm)) {
        router.push("/appeal");
      } else {
        router.push("/tax-shock");
      }
      return;
    }

    // Sell / list home → /list
    if (/\b(sell|vender|list)\b.*\b(home|house|casa|my)\b/i.test(qNorm) || /\b(quiero|want).*(sell|vender|list)/i.test(qNorm)) {
      router.push("/list");
      return;
    }

    if (/open\s*house/i.test(q)) {
      router.push("/open-houses");
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

    // If parser extracted no search params, it's a general question → send to chat
    const hasSearchParams = parsed.city || parsed.county || parsed.beds || parsed.baths
      || parsed.minPrice || parsed.maxPrice || parsed.propertyType || parsed.q;
    if (!hasSearchParams) {
      router.push(`/chat?q=${encodeURIComponent(q)}`);
      return;
    }

    const params = new URLSearchParams();
    if (parsed.city) params.set("city", parsed.city);
    if (parsed.county) params.set("county", parsed.county);
    if (parsed.beds) params.set("beds", String(parsed.beds));
    if (parsed.baths) params.set("baths", String(parsed.baths));
    if (parsed.minPrice) params.set("minPrice", String(parsed.minPrice));
    if (parsed.maxPrice) params.set("maxPrice", String(parsed.maxPrice));
    if (parsed.propertyType) params.set("propertyType", parsed.propertyType);
    if (parsed.q) params.set("q", parsed.q);

    // Sort by price when price filter is set
    if (parsed.maxPrice) params.set("sort", "price_desc");
    else if (parsed.minPrice) params.set("sort", "price_asc");

    // Navigate to search page (or IDX subdomain if configured)
    const searchUrl = IDX_SUBDOMAIN
      ? `${IDX_SUBDOMAIN}/search?${params.toString()}`
      : `/search?${params.toString()}`;
    if (IDX_SUBDOMAIN) {
      window.location.href = searchUrl;
    } else {
      router.push(searchUrl);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Search input */}
      <div className="flex overflow-hidden rounded-xl bg-white shadow-2xl px-4 py-2 items-center gap-2">
        {!voiceActive && (
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
            placeholder="Search type, an address, City, County"
            className="flex-1 px-2 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400"
          />
        )}
        <VoiceButton
          onTranscript={(text) => { setInput(text); handleSearch(text); }}
          onRecordingChange={setVoiceActive}
        />
        {!voiceActive && (
          <button
            onClick={() => handleSearch()}
            disabled={!input.trim() || searching}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            {searching ? "..." : "Search"}
          </button>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestions.map(s => (
          <button
            key={s.label}
            onClick={() => {
              router.push(`/search?${s.params}`);
            }}
            className="rounded-full border border-gray-200 px-3.5 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-navy hover:border-gray-300"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
