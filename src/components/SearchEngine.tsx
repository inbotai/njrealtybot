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
    <div className="flex min-h-screen bg-white">
      {/* Left sidebar — icon-only, expand on hover */}
      <aside className="hidden md:flex w-14 hover:w-56 flex-col border-r border-gray-200 bg-white px-2 py-6 transition-all duration-300 overflow-hidden group/sidebar">
        <Link href="/v2" className="mb-8 flex items-center gap-2 px-2">
          <svg viewBox="0 0 200 200" className="h-8 w-8 flex-shrink-0">
            <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
            <circle cx="100" cy="105" r="52" fill="#4f46e5" />
            <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
            <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-bold whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
            <span className="text-gold">Garden</span>
            <span className="text-navy"> State </span>
            <span className="text-indigo-500">AI</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-navy whitespace-nowrap"
              title={l.label}>
              <span className="text-lg flex-shrink-0">{l.icon}</span>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-2 pt-6 border-t border-gray-200 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
          <p className="text-[10px] text-gray-400">Powered by Vale AI</p>
          <p className="text-[10px] text-gray-400">BHG Real Estate | Green Team</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="text-sm font-bold">
            <span className="text-gold">Garden</span>
            <span className="text-navy"> State </span>
            <span className="text-indigo-500">AI</span>
          </span>
        </div>

        {/* Center content area */}
        <div className={`flex flex-1 flex-col ${hasMessages ? "justify-start" : "justify-start pt-[20vh]"}`}>
          {/* Hero search — centered when no messages */}
          {!hasMessages && (
            <div className="px-4">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-200 px-5 py-3 shadow-lg focus-within:border-indigo-400 focus-within:shadow-xl transition">
                  <svg viewBox="0 0 200 200" className="h-9 w-9 flex-shrink-0">
                    <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
                    <circle cx="100" cy="105" r="52" fill="#4f46e5" />
                    <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
                    <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
                    <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
                    <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {!voiceActive && (
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                      placeholder="Search homes, ask about taxes, get a valuation..."
                      className="flex-1 bg-transparent py-2 text-lg text-gray-900 outline-none placeholder:text-gray-400"
                      disabled={loading}
                    />
                  )}
                  <VoiceButton
                    onTranscript={(text) => { setInput(text); handleSearch(text); }}
                    onRecordingChange={setVoiceActive}
                  />
                  {!voiceActive && (
                    <button onClick={() => handleSearch()} disabled={!input.trim() || loading}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-30">
                      {loading ? "..." : "Search"}
                    </button>
                  )}
                </div>
                <p className="mt-3 text-center text-xs text-gray-400">
                  Search homes, get valuations, check your taxes, or ask anything about NJ real estate.
                </p>
              </div>
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
                        <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }}
                        />

                        {/* Listing cards — inline results */}
                        {msg.listings && msg.listings.length > 0 && (
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {msg.listings.map(listing => (
                              <Link key={listing.id}
                                href={`/property/${generateSlug(listing)}`}
                                className="group overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition hover:shadow-lg hover:border-indigo-300"
                              >
                                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
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
                                  <p className="text-lg font-bold text-navy">
                                    {listing.list_price ? formatPrice(listing.list_price) : "Price TBD"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-gray-500 truncate">
                                    {listing.unparsed_address || `${listing.street_number} ${listing.street_name}`}
                                  </p>
                                  <div className="mt-1 flex gap-3 text-[11px] text-gray-400">
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
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
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
                  className="rounded-full border border-gray-200 px-3.5 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-navy hover:border-gray-300">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom search bar — only when there are messages (hero search moves to bottom) */}
        {hasMessages && (
          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-2 focus-within:border-indigo-400 focus-within:shadow-md transition">
                {!voiceActive && (
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                    placeholder="Ask a follow-up..."
                    className="flex-1 bg-transparent py-2 text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
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
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Powered by Vale AI &middot; BHG Real Estate | Green Team &middot; 60,000+ MLS listings
              </p>
            </div>
          </div>
        )}
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
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-600 underline hover:text-indigo-800">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-navy'>$1</strong>")
    .replace(/(?<!")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="text-indigo-600 underline hover:text-indigo-800">$1</a>')
    .replace(/(?<!")gardenstate\.ai\/([\w-]+)/g, '<a href="/$1" class="text-indigo-600 underline hover:text-indigo-800">gardenstate.ai/$1</a>');
}
