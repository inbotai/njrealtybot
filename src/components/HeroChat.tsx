"use client";

import { useState, useRef, useEffect } from "react";
import { fetchListing, getPhotoUrl, type Listing } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";
import Link from "next/link";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

const suggestions = [
  "3 bedroom houses in Hoboken under 500k",
  "What's my home worth?",
  "Show me deals in Bergen County",
  "Condos near NYC with 2+ baths",
  "Find me a house with a pool",
];

interface Message { role: "user" | "assistant"; text: string }

export default function HeroChat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startSession() {
    if (sessionId) return sessionId;
    const vid = localStorage.getItem("vale_vid") || "";
    const r = await fetch(`${IDX_API}/api/idx/chat/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: vid || undefined }),
    });
    const d = await r.json();
    if (d.visitorId) localStorage.setItem("vale_vid", d.visitorId);
    setSessionId(d.sessionId);
    return d.sessionId;
  }

  async function send(text?: string) {
    const q = (text || query).trim();
    if (!q || loading) return;
    setQuery("");
    setExpanded(true);
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const sid = await startSession();
      const r = await fetch(`${IDX_API}/api/idx/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, message: q }),
      });
      const d = await r.json();
      const reply = d.reply || d.error || "Something went wrong.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      // Extract listing IDs from Vale's response [ID:uuid]
      const ids = [...reply.matchAll(/\[ID:([a-f0-9-]{36})\]/gi)].map((m: any) => m[1]);
      if (ids.length > 0) {
        const fetched = await Promise.all(
          ids.slice(0, 6).map((id: string) =>
            fetchListing(id).then(d => d.listing).catch(() => null)
          )
        );
        setListings(fetched.filter(Boolean) as Listing[]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Chat area — expands when conversation starts */}
      {expanded && (
        <div className="mb-3 max-h-72 overflow-y-auto rounded-xl bg-white/10 backdrop-blur p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

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
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={expanded ? "Ask a follow-up..." : "Ask Vale anything... \"3 bed house in Hoboken under 500k\""}
          className="flex-1 px-4 py-5 text-base text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          onClick={() => send()}
          disabled={loading || !query.trim()}
          className="bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          Ask Vale
        </button>
      </div>

      {/* Listing cards from Vale's response */}
      {listings.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map(l => (
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
                  {l.living_area && l.living_area > 100 ? ` / ${l.living_area.toLocaleString()} sqft` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Suggestions — hide once conversation starts */}
      {!expanded && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); send(s); }}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
