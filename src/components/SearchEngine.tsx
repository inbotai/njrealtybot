"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { parseSearchQuery, type Listing } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { getPhotoUrl } from "@/lib/api";
import VoiceButton from "./VoiceButton";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

// Sidebar links: "query" items run inline via Vale, "href" items navigate away
const NAV_LINKS: { label: string; icon: string; query?: string; href?: string }[] = [
  { label: "Home Value", icon: "\uD83C\uDFE0", query: "What is my home worth?" },
  { label: "Tax Check", icon: "\uD83D\uDCB0", query: "Am I overpaying property taxes?" },
  { label: "List My Home", icon: "\uD83D\uDCDD", query: "I want to list my home for sale" },
  { label: "News", icon: "\uD83D\uDCF0", href: "/news" },
  { label: "Market Report", icon: "\uD83D\uDCC8", query: "Give me a market report for my area" },
  { label: "Find Deals", icon: "\uD83D\uDD25", query: "Show me investment deals in NJ" },
  { label: "Open Houses", icon: "\uD83C\uDFE1", query: "Open houses this weekend" },
  { label: "FSBO Help", icon: "\uD83D\uDD13", query: "I'm selling my home without an agent, can you help?" },
  { label: "Affordability", icon: "\uD83E\uDDEE", query: "How much home can I afford?" },
  { label: "Net Proceeds", icon: "\uD83D\uDCB5", query: "How much will I net if I sell my home?" },
  { label: "Reno ROI", icon: "\uD83D\uDD28", query: "What renovations add the most value?" },
  { label: "Tax Appeal", icon: "\u2696\uFE0F", query: "Help me appeal my property taxes" },
];

const SUGGESTIONS = [
  "Houses in Hoboken under $500K",
  "3 bed rentals in Jersey City",
  "What is my home worth?",
  "Am I overpaying property taxes?",
  "Open houses this weekend",
  "Multi-family in Bergen County",
];

interface ActionCard {
  icon: string;
  title: string;
  description: string;
  href?: string;        // navigate to page
  query?: string;       // run inline search/Vale query
  buttonText: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  listings?: Listing[];
  actions?: ActionCard[];
  timestamp: number;
}

// View modes: "chat" = conversation + grid, "detail" = single property full view
type ViewMode = "chat" | "detail";

// Intent → action card mapping: detect what the user wants and show the right CTA
const ACTION_INTENTS: { pattern: RegExp; cards: ActionCard[] }[] = [
  {
    pattern: /\b(list|sell|vend|listar|poner en venta|put.*(house|home|property).*(market|sale))\b/i,
    cards: [
      { icon: "📝", title: "List Your Home", description: "Free valuation + digital listing in 5 minutes", href: "/list", buttonText: "Start Listing →" },
      { icon: "🏠", title: "What's My Home Worth?", description: "Instant AI valuation with comparable sales", href: "/sell", buttonText: "Get Valuation →" },
    ],
  },
  {
    pattern: /\b(worth|value|valuaci|cuanto vale|home value|valuation|cma|comparable|comps)\b/i,
    cards: [
      { icon: "🏠", title: "Instant Home Valuation", description: "AI analysis with MLS comps, MOD-IV, and Zestimate", href: "/sell", buttonText: "Get My Value →" },
    ],
  },
  {
    pattern: /\b(tax|taxes|impuesto|overpay|pagando de mas|property tax|tax appeal|apelar)\b/i,
    cards: [
      { icon: "💰", title: "Tax Overpayment Check", description: "See if you're overpaying in 30 seconds", href: "/tax-shock", buttonText: "Check My Taxes →" },
      { icon: "⚖️", title: "File a Tax Appeal", description: "Auto-generate Form A-1 with your data", href: "/appeal", buttonText: "Start Appeal →" },
    ],
  },
  {
    pattern: /\b(open.house|casa abierta|jornada de puertas|showing|visita)\b/i,
    cards: [
      { icon: "🏡", title: "Open Houses This Weekend", description: "Browse all upcoming open houses in NJ", href: "/open-houses", buttonText: "View Open Houses →" },
    ],
  },
  {
    pattern: /\b(deal|ganga|oferta|price.drop|baj[oó].de.precio|investment|inversion|inversi[oó]n)\b/i,
    cards: [
      { icon: "🔥", title: "Deals & Price Drops", description: "Properties with recent price reductions", href: "/deals", buttonText: "View Deals →" },
    ],
  },
  {
    pattern: /\b(fsbo|for sale by owner|sin agente|without.*(agent|realtor)|por mi cuenta)\b/i,
    cards: [
      { icon: "🔓", title: "FSBO Assistance", description: "Expert help for selling without an agent", href: "/fsbo", buttonText: "Learn More →" },
    ],
  },
  {
    pattern: /\b(afford|puedo.comprar|cuanto.puedo|how much.*(can|afford)|qualify|calific)\b/i,
    cards: [
      { icon: "🧮", title: "Affordability Calculator", description: "See how much home you can afford", href: "/affordability", buttonText: "Calculate →" },
    ],
  },
  {
    pattern: /\b(net.proceed|ganancia.neta|cuanto.me.queda|how much.*(net|keep|profit)|after.*(closing|sale))\b/i,
    cards: [
      { icon: "💵", title: "Net Proceeds Calculator", description: "Estimate what you'll keep after selling", href: "/net-proceeds", buttonText: "Calculate →" },
    ],
  },
  {
    pattern: /\b(renov|remodel|roi|mejora|upgrade|kitchen|bathroom|addition|agregar)\b/i,
    cards: [
      { icon: "🔨", title: "Renovation ROI", description: "Which renovations add the most value?", href: "/renovate", buttonText: "Check ROI →" },
    ],
  },
  {
    pattern: /\b(market.report|informe.de.mercado|how.*(is|the).market|estado del mercado)\b/i,
    cards: [
      { icon: "📈", title: "Market Report", description: "Latest NJ real estate market data", href: "/market", buttonText: "View Report →" },
    ],
  },
  {
    pattern: /\b(news|noticias|article|articulo|blog)\b/i,
    cards: [
      { icon: "📰", title: "Latest NJ Real Estate News", description: "Tax changes, market updates, and more", href: "/news", buttonText: "Read News →" },
    ],
  },
];

function detectActions(text: string): ActionCard[] {
  const norm = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const intent of ACTION_INTENTS) {
    if (intent.pattern.test(norm)) return intent.cards;
  }
  return [];
}

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

    const qNorm = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Detect explicit search intent: "houses in ...", "3 bed in ...", "condos under ..."
    const isExplicitSearch = /\b(houses?|homes?|condos?|apartments?|townhouses?|rentals?|multi.?family|duplex|listing|bedroom|(\d+)\s*bed)\b/i.test(qNorm)
      && /\b(in|near|under|around|county)\b/i.test(qNorm);
    const isFollowUp = messages.length > 0;
    let handled = false;

    // Detect action intent → attach CTA cards to the response
    const actions = detectActions(q);

    // ── Helper: try listing search ──
    async function tryListingSearch(): Promise<boolean> {
      try {
        const parsed = await parseSearchQuery(q);
        const hasParams = parsed.city || parsed.county || parsed.beds || parsed.maxPrice || parsed.propertyType;
        if (!hasParams) return false;
        const params = new URLSearchParams();
        if (parsed.city) params.set("city", parsed.city);
        if (parsed.county) params.set("county", parsed.county);
        if (parsed.beds) params.set("beds", String(parsed.beds));
        if (parsed.baths) params.set("baths", String(parsed.baths));
        if (parsed.minPrice) params.set("minPrice", String(parsed.minPrice));
        if (parsed.maxPrice) params.set("maxPrice", String(parsed.maxPrice));
        if (parsed.propertyType) params.set("propertyType", parsed.propertyType);
        params.set("limit", "50");
        const res = await fetch(`${IDX_API}/api/idx/listings?${params.toString()}`);
        if (!res.ok) return false;
        const data = await res.json();
        const listings = data.listings || [];
        const total = data.total || listings.length;
        if (listings.length === 0) return false;
        setCurrentListings(listings);
        const countText = total > listings.length
          ? `Found **${total} properties** (showing top ${listings.length}). Click any listing to see full details.`
          : `Found **${total} properties**. Click any listing to see full details.`;
        setMessages(prev => [...prev, { role: "assistant", text: countText, listings, timestamp: Date.now() }]);
        return true;
      } catch { return false; }
    }

    // ── Helper: call Vale chat ──
    async function tryVale(): Promise<boolean> {
      if (!sessionId) return false;
      try {
        const res = await fetch(`${IDX_API}/api/idx/chat/message`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: q }), signal: AbortSignal.timeout(60000),
        });
        if (!res.ok) return false;
        const data = await res.json();
        const reply = data.reply || data.response || data.text || "";
        if (!reply) return false;
        // Detect actions from Vale's response too (in case user asks generally)
        const replyActions = actions.length > 0 ? actions : detectActions(reply);
        setMessages(prev => [...prev, { role: "assistant", text: reply, actions: replyActions.length > 0 ? replyActions : undefined, timestamp: Date.now() }]);
        return true;
      } catch { return false; }
    }

    // ── EXPLICIT SEARCH: always search first, regardless of follow-up ──
    if (isExplicitSearch) {
      handled = await tryListingSearch();
      // Also send to Vale for context (fire-and-forget, don't show response)
      if (handled && sessionId) {
        fetch(`${IDX_API}/api/idx/chat/message`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: q }),
        }).catch(() => {});
      }
    }

    // ── FOLLOW-UP (non-search): Vale first to maintain conversation context ──
    if (!handled && isFollowUp) {
      handled = await tryVale();
    }

    // ── FIRST MESSAGE (non-search): Vale handles it, with action cards ──
    if (!handled) {
      handled = await tryVale();
    }

    // ── Fallback: try search if Vale failed ──
    if (!handled) {
      handled = await tryListingSearch();
    }

    if (!handled) {
      setMessages(prev => [...prev, { role: "assistant", text: "I'm having trouble connecting. Please try again in a moment.", timestamp: Date.now() }]);
    }
    setLoading(false);
  }, [input, loading, sessionId, messages.length]);

  const hasMessages = messages.length > 0;
  const hasListings = messages.some(m => m.listings && m.listings.length > 0);
  const detail = currentListings[detailIndex] || null;
  const photoCount = detail?.photo_count || 10;

  // Brokerage banner — IDX compliance: must be prominent when showing listings
  const BrokerageBanner = () => (
    <div className="flex items-center gap-4 rounded-xl bg-navy/5 border border-navy/10 px-5 py-3">
      <img src="/bhg-green-team-logo-dark.jpg" alt="Better Homes and Gardens Real Estate | Green Team" className="h-20 w-auto shrink-0" />
      <div className="text-sm leading-tight">
        <p className="font-bold text-navy">Better Homes and Gardens Real Estate | Green Team</p>
        <p className="text-gray-500 text-xs mt-0.5">Property search provided through IDX (GSMLS/NJMLS)</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
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
          {NAV_LINKS.map(l => l.href ? (
            <Link key={l.label} href={l.href} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-navy whitespace-nowrap" title={l.label}>
              <span className="text-lg flex-shrink-0">{l.icon}</span>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">{l.label}</span>
            </Link>
          ) : (
            <button key={l.label} onClick={() => handleSearch(l.query!)}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-navy whitespace-nowrap text-left" title={l.label}>
              <span className="text-lg flex-shrink-0">{l.icon}</span>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">{l.label}</span>
            </button>
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
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={backToResults} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    &larr; See All Results
                  </button>
                  <span className="hidden sm:inline text-[10px] text-gray-300">|</span>
                  <img src="/bhg-green-team-logo-dark.jpg" alt="BHG Green Team" className="hidden sm:block h-10 w-auto" />
                </div>
                <span className="text-xs text-gray-400">{detailIndex + 1} of {currentListings.length}</span>
                <div className="flex gap-2">
                  <button disabled={detailIndex === 0} onClick={() => setDetailIndex(i => i - 1)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-navy hover:bg-gray-50 disabled:opacity-30">&larr; Prev</button>
                  <button disabled={detailIndex >= currentListings.length - 1} onClick={() => setDetailIndex(i => i + 1)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-navy hover:bg-gray-50 disabled:opacity-30">Next &rarr;</button>
                  <button onClick={newSearch} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">New Search</button>
                </div>
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

              {/* Brokerage compliance */}
              <div className="mt-6"><BrokerageBanner /></div>

              {/* Bottom nav */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
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
            <div className={`flex flex-1 flex-col overflow-y-auto ${hasMessages ? "justify-start" : "items-center justify-center"}`}>
              {/* Hero search */}
              {!hasMessages && (
                <div className="w-full px-4 -mt-16">
                  <div className="mx-auto max-w-2xl text-center">
                    <h1 className="mb-6 text-3xl sm:text-4xl font-bold text-navy">What can I help you find?</h1>
                    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-200 px-6 py-4 shadow-xl focus-within:border-indigo-400 focus-within:shadow-2xl transition">
                      <svg viewBox="0 0 200 200" className="h-10 w-10 flex-shrink-0">
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
                          className="flex-1 bg-transparent py-3 text-xl text-gray-900 outline-none placeholder:text-gray-400" disabled={loading} />
                      )}
                      <VoiceButton onTranscript={(text) => { setInput(text); handleSearch(text); }} onRecordingChange={setVoiceActive} />
                      {!voiceActive && (
                        <button onClick={() => handleSearch()} disabled={!input.trim() || loading}
                          className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-30">
                          {loading ? "..." : "Search"}
                        </button>
                      )}
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-400">Search homes, get valuations, check your taxes, or ask anything about NJ real estate.</p>
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

                            {/* Action cards — CTAs inline */}
                            {msg.actions && msg.actions.length > 0 && (
                              <div className={`grid gap-3 ${msg.actions.length === 1 ? "max-w-sm" : "sm:grid-cols-2"}`}>
                                {msg.actions.map((action, ai) => (
                                  <a key={ai} href={action.href || "#"}
                                    onClick={action.query ? (e) => { e.preventDefault(); handleSearch(action.query!); } : undefined}
                                    className="group flex items-start gap-4 rounded-xl bg-white border-2 border-indigo-100 p-4 shadow-sm transition hover:shadow-lg hover:border-indigo-400 cursor-pointer">
                                    <span className="text-3xl shrink-0">{action.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-navy text-sm">{action.title}</p>
                                      <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                                      <span className="mt-2 inline-block rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white group-hover:bg-indigo-700 transition">
                                        {action.buttonText}
                                      </span>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            )}

                            {msg.listings && msg.listings.length > 0 && (
                              <><BrokerageBanner />
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
                              </>
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
              <div className="border-t border-gray-200 bg-white px-4 py-4">
                <div className="mx-auto max-w-3xl">
                  <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-200 px-5 py-3 shadow-sm focus-within:border-indigo-400 focus-within:shadow-lg transition">
                    {!voiceActive && (
                      <input type="text" value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                        placeholder="Ask a follow-up..." className="flex-1 bg-transparent py-2.5 text-lg text-gray-900 outline-none placeholder:text-gray-400" disabled={loading} />
                    )}
                    <VoiceButton onTranscript={(text) => { setInput(text); handleSearch(text); }} onRecordingChange={setVoiceActive} />
                    {!voiceActive && (
                      <button onClick={() => handleSearch()} disabled={!input.trim() || loading}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-30">{loading ? "..." : "Search"}</button>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    {hasListings && <img src="/bhg-green-team-logo-dark.jpg" alt="BHG Green Team" className="h-8 w-auto" />}
                    <p className="text-[10px] text-gray-400">
                      {hasListings ? "Listing data provided through IDX by BHG Real Estate | Green Team" : "Powered by Vale AI \u00b7 BHG Real Estate | Green Team \u00b7 60,000+ MLS listings"}
                    </p>
                  </div>
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
