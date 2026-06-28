"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchListings, parseSearchQuery, type Listing } from "@/lib/api";
import { formatPrice, generateSlug } from "@/lib/utils";
import { getPhotoUrl } from "@/lib/api";
import VoiceButton from "./VoiceButton";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

const NAV_LINKS = [
  { href: "/sell", label: "Home Value", icon: "\uD83C\uDFE0" },
  { href: "/tax-shock", label: "Tax Check", icon: "\uD83D\uDCB0" },
  { href: "/list", label: "List My Home", icon: "\uD83D\uDCDD" },
  { href: "/news", label: "News", icon: "\uD83D\uDCF0" },
  { href: "/market", label: "Market", icon: "\uD83D\uDCC8" },
  { href: "/deals", label: "Deals", icon: "\uD83D\uDD25" },
  { href: "/open-houses", label: "Open Houses", icon: "\uD83C\uDFE1" },
  { href: "/fsbo", label: "FSBO Help", icon: "\uD83D\uDD13" },
  { href: "/afford", label: "Affordability", icon: "\uD83E\uDDEE" },
  { href: "/net-proceeds", label: "Net Proceeds", icon: "\uD83D\uDCB5" },
  { href: "/renovate", label: "Reno ROI", icon: "\uD83D\uDD28" },
  { href: "/appeal", label: "Tax Appeal", icon: "\u2696\uFE0F" },
];

const SUGGESTIONS = [
  "Houses in Hoboken under $500K",
  "3 bed rentals in Jersey City",
  "What is my home worth?",
  "Am I overpaying property taxes?",
  "Open houses this weekend",
  "Multi-family in Bergen County",
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  listings?: Listing[];
  timestamp: number;
}

export default function SearchEngine() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on load
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Init chat session
  useEffect(() => {
    fetch(`${IDX_API}/api/idx/chat/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then(r => r.json())
      .then(d => setSessionId(d.sessionId || d.session_id))
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");

    // Add user message
    setMessages(prev => [...prev, { role: "user", text: q, timestamp: Date.now() }]);
    setLoading(true);

    try {
      // Try to parse as property search first
      const qNorm = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const isSearch = !/tax|taxes|worth|value|cma|sell|vender|appeal|how much|cuanto vale|fsbo|open.house/i.test(qNorm);

      if (isSearch) {
        const parsed = await parseSearchQuery(q);
        const hasParams = parsed.city || parsed.county || parsed.beds || parsed.maxPrice || parsed.propertyType;

        if (hasParams) {
          // Fetch listings inline
          const params = new URLSearchParams();
          if (parsed.city) params.set("city", parsed.city);
          if (parsed.county) params.set("county", parsed.county);
          if (parsed.beds) params.set("beds", String(parsed.beds));
          if (parsed.baths) params.set("baths", String(parsed.baths));
          if (parsed.minPrice) params.set("minPrice", String(parsed.minPrice));
          if (parsed.maxPrice) params.set("maxPrice", String(parsed.maxPrice));
          if (parsed.propertyType) params.set("propertyType", parsed.propertyType);
          params.set("limit", "12");

          const res = await fetch(`${IDX_API}/api/idx/listings?${params.toString()}`);
          const data = await res.json();

          const summary = data.total > 0
            ? `Found **${data.total} properties** matching your search. Here are the top results:`
            : "No properties found matching that criteria. Try broadening your search.";

          setMessages(prev => [...prev, {
            role: "assistant",
            text: summary,
            listings: data.listings || [],
            timestamp: Date.now(),
          }]);
          setLoading(false);
          return;
        }
      }

      // Send to Vale for conversational responses (CMA, taxes, general questions)
      if (sessionId) {
        const res = await fetch(`${IDX_API}/api/idx/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: q }),
          signal: AbortSignal.timeout(60000),
        });
        const data = await res.json();
        const response = data.response || data.text || "I couldn't process that request.";

        setMessages(prev => [...prev, {
          role: "assistant",
          text: response,
          timestamp: Date.now(),
        }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Something went wrong. Please try again.",
        timestamp: Date.now(),
      }]);
    }
    setLoading(false);
  }, [input, loading, sessionId]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex min-h-screen bg-[#0f0a1e]">
      {/* Left sidebar — nav links */}
      <aside className="hidden md:flex w-56 flex-col border-r border-white/10 bg-[#0f0a1e] px-3 py-6">
        <Link href="/v2" className="mb-8 px-3 text-lg font-bold">
          <span className="text-gold">Garden</span>
          <span className="text-white"> State </span>
          <span className="text-indigo-400">AI</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white">
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-3 pt-6 border-t border-white/10">
          <p className="text-[10px] text-gray-600">Powered by Vale AI</p>
          <p className="text-[10px] text-gray-600">BHG Real Estate | Green Team</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-sm font-bold">
            <span className="text-gold">Garden</span>
            <span className="text-white"> State </span>
            <span className="text-indigo-400">AI</span>
          </span>
        </div>

        {/* Center content area */}
        <div className={`flex flex-1 flex-col ${hasMessages ? "justify-start" : "justify-center"}`}>
          {/* Hero — only show when no messages */}
          {!hasMessages && (
            <div className="px-4 text-center">
              <h1 className="text-4xl font-extrabold text-white md:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">Garden</span>
                <span className="text-white"> State </span>
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite_0.5s]">AI</span>
              </h1>
              <p className="mt-3 text-gray-500 text-sm md:text-base">
                Search homes, get valuations, check your taxes, or ask anything about NJ real estate.
              </p>
            </div>
          )}

          {/* Messages / Results */}
          {hasMessages && (
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-3 text-white text-[15px]">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Text response */}
                        <div className="rounded-2xl bg-white/5 px-5 py-4 text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }}
                        />

                        {/* Listing cards — inline results */}
                        {msg.listings && msg.listings.length > 0 && (
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {msg.listings.map(listing => (
                              <Link key={listing.id}
                                href={`/property/${generateSlug(listing)}`}
                                className="group overflow-hidden rounded-xl bg-white/5 border border-white/10 transition hover:border-indigo-500/50 hover:bg-white/10"
                              >
                                <div className="aspect-[4/3] bg-gray-800 relative overflow-hidden">
                                  <img
                                    src={listing.primary_photo_url || getPhotoUrl(listing.mls_number)}
                                    alt={listing.unparsed_address || "Property"}
                                    className="h-full w-full object-cover transition group-hover:scale-105"
                                    loading="lazy"
                                  />
                                  <span className="absolute top-2 left-2 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                    {listing.mls_status || "Active"}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <p className="text-lg font-bold text-white">
                                    {listing.list_price ? formatPrice(listing.list_price) : "Price TBD"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-gray-400 truncate">
                                    {listing.unparsed_address || `${listing.street_number} ${listing.street_name}`}
                                  </p>
                                  <div className="mt-1 flex gap-3 text-[11px] text-gray-500">
                                    {listing.bedrooms_total != null && <span>{listing.bedrooms_total} Beds</span>}
                                    {listing.bathrooms_total != null && <span>{listing.bathrooms_total} Baths</span>}
                                    {listing.living_area != null && <span>{listing.living_area.toLocaleString()} sqft</span>}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading */}
                {loading && (
                  <div className="rounded-2xl bg-white/5 px-5 py-4">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          )}

          {/* Suggestions — only when no messages */}
          {!hasMessages && (
            <div className="mt-8 flex flex-wrap justify-center gap-2 px-4">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSearch(s)}
                  className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white hover:border-white/30">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search bar — always at bottom */}
        <div className={`border-t border-white/10 bg-[#0f0a1e] px-4 ${hasMessages ? "py-3" : "py-6"}`}>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-4 py-2 focus-within:border-indigo-500/50 transition">
              {!voiceActive && (
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                  placeholder="Search homes, ask about taxes, get a valuation..."
                  className="flex-1 bg-transparent py-2 text-[15px] text-white outline-none placeholder:text-gray-500"
                  disabled={loading}
                />
              )}
              <VoiceButton
                onTranscript={(text) => { setInput(text); handleSearch(text); }}
                onRecordingChange={setVoiceActive}
              />
              {!voiceActive && (
                <button onClick={() => handleSearch()} disabled={!input.trim() || loading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-30">
                  {loading ? "..." : "Search"}
                </button>
              )}
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-600">
              Powered by Vale AI &middot; BHG Real Estate | Green Team &middot; 60,000+ MLS listings
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Format Vale response: bold, links, strip IDs */
function formatResponse(text: string): string {
  return text
    .replace(/\[ID:[a-f0-9-]+\]/gi, "")
    .trim()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-400 underline hover:text-indigo-300">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-white'>$1</strong>")
    .replace(/(?<!")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="text-indigo-400 underline hover:text-indigo-300">$1</a>')
    .replace(/(?<!")gardenstate\.ai\/([\w-]+)/g, '<a href="/$1" class="text-indigo-400 underline hover:text-indigo-300">gardenstate.ai/$1</a>');
}
