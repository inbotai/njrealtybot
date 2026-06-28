"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { parseSearchQuery, type Listing } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
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

// View modes: "chat" = conversation + grid, "detail" = single property full view
type ViewMode = "chat" | "detail";

export default function SearchEngine() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [currentListings, setCurrentListings] = useState<Listing[]>([]);
  const [detailIndex, setDetailIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    fetch(`${IDX_API}/api/idx/chat/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then(r => r.json()).then(d => setSessionId(d.sessionId || d.session_id)).catch(() => {});
  }, []);

  // Reset photo index when listing changes
  useEffect(() => { setPhotoIndex(0); }, [detailIndex]);
  // Scroll to top when entering detail view
  useEffect(() => { if (viewMode === "detail") detailRef.current?.scrollTo(0, 0); }, [viewMode, detailIndex]);

  function openDetail(listings: Listing[], index: number) {
    setCurrentListings(listings);
    setDetailIndex(index);
    setViewMode("detail");
  }

  function backToResults() {
    setViewMode("chat");
  }

  function newSearch() {
    setMessages([]);
    setViewMode("chat");
    setCurrentListings([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const handleSearch = useCallback(async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setViewMode("chat");
    setMessages(prev => [...prev, { role: "user", text: q, timestamp: Date.now() }]);
    setLoading(true);

    try {
      const qNorm = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const isSearch = !/tax|taxes|worth|value|cma|sell|vender|appeal|how much|cuanto vale|fsbo|open.house/i.test(qNorm);

      if (isSearch) {
        const parsed = await parseSearchQuery(q);
        const hasParams = parsed.city || parsed.county || parsed.beds || parsed.maxPrice || parsed.propertyType;
        if (hasParams) {
          const params = new URLSearchParams();
          if (parsed.city) params.set("city", parsed.city);
          if (parsed.county) params.set("county", parsed.county);
          if (parsed.beds) params.set("beds", String(parsed.beds));
          if (parsed.baths) params.set("baths", String(parsed.baths));
          if (parsed.minPrice) params.set("minPrice", String(parsed.minPrice));
          if (parsed.maxPrice) params.set("maxPrice", String(parsed.maxPrice));
          if (parsed.propertyType) params.set("propertyType", parsed.propertyType);
          params.set("limit", "18");

          const res = await fetch(`${IDX_API}/api/idx/listings?${params.toString()}`);
          const data = await res.json();
          const listings = data.listings || [];
          setCurrentListings(listings);

          setMessages(prev => [...prev, {
            role: "assistant",
            text: data.total > 0 ? `Found **${data.total} properties**. Click any listing to see full details.` : "No properties found. Try broadening your search.",
            listings, timestamp: Date.now(),
          }]);
          setLoading(false);
          return;
        }
      }

      if (sessionId) {
        const res = await fetch(`${IDX_API}/api/idx/chat/message`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: q }), signal: AbortSignal.timeout(60000),
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", text: data.response || data.text || "Something went wrong.", timestamp: Date.now() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Please try again.", timestamp: Date.now() }]);
    }
    setLoading(false);
  }, [input, loading, sessionId]);

  const hasMessages = messages.length > 0;
  const detail = currentListings[detailIndex] || null;
  const photoCount = detail?.photo_count || 10;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
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
            <span className="text-gold">Garden</span><span className="text-navy"> State </span><span className="text-indigo-500">AI</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-navy whitespace-nowrap" title={l.label}>
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

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="text-sm font-bold"><span className="text-gold">Garden</span><span className="text-navy"> State </span><span className="text-indigo-500">AI</span></span>
        </div>

        {/* ═══ DETAIL VIEW ═══ */}
        {viewMode === "detail" && detail && (
          <div ref={detailRef} className="flex-1 overflow-y-auto">
            {/* Nav bar top */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur px-4 py-2.5">
              <button onClick={backToResults} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                &larr; See All Results
              </button>
              <span className="text-xs text-gray-400">{detailIndex + 1} of {currentListings.length}</span>
              <div className="flex gap-2">
                <button disabled={detailIndex === 0} onClick={() => setDetailIndex(i => i - 1)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-navy hover:bg-gray-50 disabled:opacity-30">&larr; Prev</button>
                <button disabled={detailIndex >= currentListings.length - 1} onClick={() => setDetailIndex(i => i + 1)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-navy hover:bg-gray-50 disabled:opacity-30">Next &rarr;</button>
                <button onClick={newSearch} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">New Search</button>
              </div>
            </div>

            {/* Photo gallery */}
            <div className="relative bg-gray-100">
              <div className="mx-auto max-w-4xl">
                <img
                  src={detail.primary_photo_url || getPhotoUrl(detail.mls_number, photoIndex)}
                  alt={detail.unparsed_address || "Property"}
                  className="w-full max-h-[500px] object-contain"
                />
                {/* Photo nav */}
                <div className="absolute inset-y-0 left-2 flex items-center">
                  <button disabled={photoIndex === 0} onClick={() => setPhotoIndex(i => i - 1)}
                    className="rounded-full bg-white/80 p-2 shadow hover:bg-white disabled:opacity-30 text-lg">&lsaquo;</button>
                </div>
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <button disabled={photoIndex >= photoCount - 1} onClick={() => setPhotoIndex(i => i + 1)}
                    className="rounded-full bg-white/80 p-2 shadow hover:bg-white disabled:opacity-30 text-lg">&rsaquo;</button>
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  {photoIndex + 1} / {photoCount}
                </div>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-1 overflow-x-auto px-4 py-2 bg-gray-50">
                {Array.from({ length: Math.min(photoCount, 15) }).map((_, idx) => (
                  <button key={idx} onClick={() => setPhotoIndex(idx)}
                    className={`flex-shrink-0 rounded overflow-hidden ${idx === photoIndex ? "ring-2 ring-indigo-500" : "opacity-70 hover:opacity-100"}`}>
                    <img src={getPhotoUrl(detail.mls_number, idx)} alt={`Thumb ${idx + 1}`}
                      className="h-16 w-24 object-cover" loading="lazy"
                      onError={e => (e.currentTarget.parentElement!.style.display = "none")} />
                  </button>
                ))}
              </div>
            </div>

            {/* Property details */}
            <div className="mx-auto max-w-4xl px-4 py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white">{detail.mls_status || "Active"}</span>
                  <h2 className="mt-2 text-3xl font-bold text-navy">{detail.list_price ? formatPrice(detail.list_price) : "Price TBD"}</h2>
                  <p className="mt-1 text-gray-600">{detail.unparsed_address || `${detail.street_number} ${detail.street_name}`}</p>
                  <p className="text-sm text-gray-400">{detail.city}, NJ {detail.postal_code}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { backToResults(); handleSearch(`CMA for ${detail.unparsed_address || detail.city}`); }}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Get CMA</button>
                  <button onClick={() => { backToResults(); handleSearch(`schedule a showing at ${detail.unparsed_address || detail.city}`); }}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-gray-50">Schedule Showing</button>
                </div>
              </div>

              {/* Stats grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { label: "Beds", value: detail.bedrooms_total },
                  { label: "Baths", value: detail.bathrooms_total },
                  { label: "Sqft", value: detail.living_area?.toLocaleString() },
                  { label: "Lot", value: detail.lot_size_area ? `${detail.lot_size_area} acres` : null },
                  { label: "Year Built", value: detail.year_built },
                  { label: "Type", value: detail.property_type },
                ].filter(s => s.value != null).map(s => (
                  <div key={s.label} className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center">
                    <p className="text-lg font-bold text-navy">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {detail.public_remarks && (
                <div className="mt-6">
                  <h3 className="font-bold text-navy">Description</h3>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{detail.public_remarks}</p>
                </div>
              )}

              {/* Listing info */}
              <div className="mt-6 rounded-lg bg-gray-50 border border-gray-100 p-4">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  {detail.mls_number && <div><span className="text-gray-500">MLS #:</span> <span className="text-navy font-medium">{detail.mls_number}</span></div>}
                  {detail.list_date && <div><span className="text-gray-500">Listed:</span> <span className="text-navy">{new Date(detail.list_date).toLocaleDateString()}</span></div>}
                  {detail.listing_office_name && <div><span className="text-gray-500">Office:</span> <span className="text-navy">{detail.listing_office_name}</span></div>}
                  {detail.listing_agent_name && <div><span className="text-gray-500">Agent:</span> <span className="text-navy">{detail.listing_agent_name}</span></div>}
                  {detail.county && <div><span className="text-gray-500">County:</span> <span className="text-navy">{detail.county}</span></div>}
                </div>
              </div>

              {/* Bottom nav */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                <button disabled={detailIndex === 0} onClick={() => setDetailIndex(i => i - 1)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50 disabled:opacity-30">&larr; Previous Property</button>
                <button onClick={backToResults} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">See All Results</button>
                {detailIndex < currentListings.length - 1 ? (
                  <button onClick={() => setDetailIndex(i => i + 1)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50">Next Property &rarr;</button>
                ) : (
                  <button onClick={newSearch} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">New Search</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CHAT VIEW ═══ */}
        {viewMode === "chat" && (
          <>
            <div className={`flex flex-1 flex-col overflow-y-auto ${hasMessages ? "justify-start" : "justify-start pt-[20vh]"}`}>
              {/* Hero search */}
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
                        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                          placeholder="Search homes, ask about taxes, get a valuation..."
                          className="flex-1 bg-transparent py-2 text-lg text-gray-900 outline-none placeholder:text-gray-400" disabled={loading} />
                      )}
                      <VoiceButton onTranscript={(text) => { setInput(text); handleSearch(text); }} onRecordingChange={setVoiceActive} />
                      {!voiceActive && (
                        <button onClick={() => handleSearch()} disabled={!input.trim() || loading}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-30">
                          {loading ? "..." : "Search"}
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-center text-xs text-gray-400">Search homes, get valuations, check your taxes, or ask anything about NJ real estate.</p>
                  </div>
                </div>
              )}

              {/* Messages */}
              {hasMessages && (
                <div className="flex-1 px-4 py-6">
                  <div className="mx-auto max-w-3xl space-y-6">
                    {messages.map((msg, i) => (
                      <div key={i}>
                        {msg.role === "user" ? (
                          <div className="flex justify-end">
                            <div className="max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-3 text-white text-[15px]">{msg.text}</div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }} />

                            {msg.listings && msg.listings.length > 0 && (
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {msg.listings.map((listing, li) => (
                                  <button key={listing.id} onClick={() => openDetail(msg.listings!, li)}
                                    className="group overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition hover:shadow-lg hover:border-indigo-300 text-left">
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                      <img src={listing.primary_photo_url || getPhotoUrl(listing.mls_number)} alt={listing.unparsed_address || "Property"}
                                        className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                                      <span className="absolute top-2 left-2 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">{listing.mls_status || "Active"}</span>
                                    </div>
                                    <div className="p-3">
                                      <p className="text-lg font-bold text-navy">{listing.list_price ? formatPrice(listing.list_price) : "Price TBD"}</p>
                                      <p className="mt-0.5 text-xs text-gray-500 truncate">{listing.unparsed_address || `${listing.street_number} ${listing.street_name}`}</p>
                                      <div className="mt-1 flex gap-3 text-[11px] text-gray-400">
                                        {listing.bedrooms_total != null && <span>{listing.bedrooms_total} Beds</span>}
                                        {listing.bathrooms_total != null && <span>{listing.bathrooms_total} Baths</span>}
                                        {listing.living_area != null && <span>{listing.living_area.toLocaleString()} sqft</span>}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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

              {/* Suggestions */}
              {!hasMessages && (
                <div className="mt-8 flex flex-wrap justify-center gap-2 px-4">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="rounded-full border border-gray-200 px-3.5 py-1.5 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-navy hover:border-gray-300">{s}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom search bar */}
            {hasMessages && (
              <div className="border-t border-gray-200 bg-white px-4 py-3">
                <div className="mx-auto max-w-3xl">
                  <div className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-2 focus-within:border-indigo-400 focus-within:shadow-md transition">
                    {!voiceActive && (
                      <input type="text" value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                        placeholder="Ask a follow-up..." className="flex-1 bg-transparent py-2 text-[15px] text-gray-900 outline-none placeholder:text-gray-400" disabled={loading} />
                    )}
                    <VoiceButton onTranscript={(text) => { setInput(text); handleSearch(text); }} onRecordingChange={setVoiceActive} />
                    {!voiceActive && (
                      <button onClick={() => handleSearch()} disabled={!input.trim() || loading}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-30">{loading ? "..." : "Search"}</button>
                    )}
                  </div>
                  <p className="mt-2 text-center text-[10px] text-gray-400">Powered by Vale AI &middot; BHG Real Estate | Green Team &middot; 60,000+ MLS listings</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function formatResponse(text: string): string {
  return text
    .replace(/\[ID:[a-f0-9-]+\]/gi, "").trim()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-600 underline hover:text-indigo-800">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-navy'>$1</strong>")
    .replace(/(?<!")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="text-indigo-600 underline hover:text-indigo-800">$1</a>')
    .replace(/(?<!")gardenstate\.ai\/([\w-]+)/g, '<a href="/$1" class="text-indigo-600 underline hover:text-indigo-800">gardenstate.ai/$1</a>');
}
