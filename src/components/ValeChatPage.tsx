"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Listing } from "@/lib/api";
import { getPhotoUrl } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";
import VoiceButton from "./VoiceButton";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  listings?: Listing[];
}

/** Strip [ID:uuid] markers from text */
function cleanText(text: string): string {
  return text.replace(/\[ID:[a-f0-9-]{36}\]/gi, "").trim();
}

/** Compact listing card for inline chat display */
function ChatListingCard({ listing }: { listing: Listing }) {
  const photo =
    listing.photo_count > 0
      ? getPhotoUrl(listing.mls_number)
      : listing.primary_photo_url;

  return (
    <Link
      href={`/property/${generateSlug(listing)}`}
      target="_blank"
      className="flex gap-3 rounded-lg border border-gray-200 bg-white p-2 transition hover:shadow-md hover:border-indigo-300"
    >
      <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
        {photo ? (
          <img
            src={photo}
            alt={formatAddress(listing)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No Photo
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <p className="text-sm font-bold text-navy">
          {listing.list_price ? formatPrice(listing.list_price) : "Price TBD"}
        </p>
        <p className="truncate text-xs text-gray-600">{formatAddress(listing)}</p>
        <div className="mt-1 flex gap-2 text-xs text-gray-500">
          {listing.bedrooms_total != null && (
            <span>{listing.bedrooms_total} Beds</span>
          )}
          {listing.bathrooms_total != null && (
            <span>{listing.bathrooms_total} Baths</span>
          )}
          {listing.living_area != null && listing.living_area > 100 && (
            <span>{listing.living_area.toLocaleString()} Sqft</span>
          )}
        </div>
        <span className="mt-1 text-[10px] font-medium text-indigo-600">
          View Details &rarr;
        </span>
      </div>
    </Link>
  );
}

export default function ValeChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSent = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionRef.current) return sessionRef.current;
    const vid = localStorage.getItem("vale_vid") || "";
    const body: Record<string, string> = {};
    if (vid) body.visitorId = vid;
    const r = await fetch(`${IDX_API}/api/idx/chat/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`Session start failed: ${r.status}`);
    const d = await r.json();
    if (d.visitorId) localStorage.setItem("vale_vid", d.visitorId);
    sessionRef.current = d.sessionId;
    setSessionId(d.sessionId);
    if (d.greeting) {
      setMessages([{ role: "assistant", text: d.greeting }]);
    }
    return d.sessionId;
  }, []);

  // Start session on mount
  useEffect(() => {
    ensureSession().catch((err) => {
      console.error("[Vale chat] session init error:", err);
      setMessages([{ role: "assistant", text: "Could not connect. Please refresh the page." }]);
    });
  }, [ensureSession]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput("");
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setLoading(true);

      try {
        const sid = await ensureSession();
        const r = await fetch(`${IDX_API}/api/idx/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid, message: trimmed }),
          signal: AbortSignal.timeout(60000),
        });
        if (!r.ok) throw new Error(`Message failed: ${r.status}`);
        const d = await r.json();
        const reply = d.reply || d.error || "Something went wrong.";

        // Extract listing IDs and fetch them
        const ids = [...reply.matchAll(/\[ID:([a-f0-9-]{36})\]/gi)].map(
          (m: RegExpMatchArray) => m[1]
        );

        let listings: Listing[] = [];
        if (ids.length > 0) {
          const fetched = await Promise.all(
            ids.slice(0, 12).map((id: string) =>
              fetch(`${IDX_API}/api/idx/listings/${id}`, {
                signal: AbortSignal.timeout(8000),
              })
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => d?.listing || null)
                .catch(() => null)
            )
          );
          listings = fetched.filter(Boolean);
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: reply, listings },
        ]);
      } catch (err) {
        console.error("[Vale chat] send error:", err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Connection error. Please try again." },
        ]);
      }
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [loading, ensureSession]
  );

  // Auto-send query from URL param (e.g. /chat?q=cma+for+123+main+st)
  useEffect(() => {
    try {
      const q = searchParams.get("q");
      if (q && !autoSent.current) {
        autoSent.current = true;
        // Wait for session to be ready, then send
        const timer = setTimeout(() => {
          send(q).catch((err) => console.error("[Vale chat] auto-send error:", err));
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("[Vale chat] URL param error:", err);
    }
  }, [searchParams, send]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="fixed inset-0 top-[72px] z-30 flex flex-col bg-gray-50">
     <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 py-3">
        <div className="relative">
          <svg viewBox="0 0 200 200" className="h-10 w-10 drop-shadow">
            <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
            <circle cx="100" cy="105" r="52" fill="#4f46e5" />
            <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <path
              d="M85 118Q100 130 115 118"
              fill="none"
              stroke="#ede9fe"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity=".6"
            />
            <path
              d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 border border-white" />
          </span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-navy">Vale</h1>
          <p className="text-xs text-gray-500">
            AI Real Estate Partner &bull; Online
          </p>
        </div>
        <a
          href="https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#128C7E] transition hover:bg-[#25D366]/20"
        >
          <svg viewBox="0 0 32 32" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
          </svg>
          <span className="hidden sm:inline">Use WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>

      {/* WhatsApp promo — MOBILE: full takeover CTA */}
      <a
        href="https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-[#25D366]/30 bg-[#25D366] px-4 py-3 md:hidden"
      >
        <svg viewBox="0 0 32 32" fill="white" className="h-8 w-8 flex-shrink-0">
          <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Continue on WhatsApp</p>
          <p className="text-xs text-white/80">
            Instant CMAs, photos, appointments & alerts — all on your phone
          </p>
        </div>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="h-5 w-5 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>

      {/* WhatsApp promo — DESKTOP: subtle inline banner */}
      <div className="hidden md:flex items-center gap-3 rounded-lg border border-[#25D366]/20 bg-gradient-to-r from-[#25D366]/5 to-transparent px-4 py-2.5">
        <svg viewBox="0 0 32 32" fill="#25D366" className="h-5 w-5 flex-shrink-0">
          <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
        </svg>
        <p className="flex-1 text-xs text-gray-600">
          <span className="font-semibold text-gray-800">On the go?</span> Chat with Vale on WhatsApp — instant CMAs, property photos & market alerts, all in one app.
        </p>
        <a
          href="https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#20bd5a]"
        >
          Open WhatsApp
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{cleanText(msg.text)}</p>
                </div>
              </div>

              {/* Inline listing cards */}
              {msg.listings && msg.listings.length > 0 && (
                <div className="ml-0 mt-2 space-y-2 sm:ml-2">
                  {msg.listings.map((listing) => (
                    <ChatListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-200 py-3"
      >
        {!voiceActive && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search homes, ask about market trends, schedule a showing..."
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            disabled={loading}
          />
        )}
        <VoiceButton
          onTranscript={(text) => send(text)}
          onRecordingChange={setVoiceActive}
          className={voiceActive ? "" : "rounded-xl border border-gray-300 bg-white p-2.5 text-gray-500 hover:bg-gray-50"}
        />
        {!voiceActive && (
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Send
          </button>
        )}
      </form>
      <p className="mt-2 text-center text-[10px] text-gray-400 leading-relaxed">
        By chatting, you consent to receive messages from Garden State AI about property alerts and real estate services.
        Msg frequency varies. Msg & data rates may apply. Reply STOP to opt out.
        Your mobile info will not be shared with third parties.{" "}
        <a href="/privacy" target="_blank" className="underline hover:text-indigo-500">Privacy Policy</a>
        {" & "}
        <a href="/terms" target="_blank" className="underline hover:text-indigo-500">Terms</a>.
      </p>
     </div>
    </div>
  );
}
