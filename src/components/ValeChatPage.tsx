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
    });
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
    ensureSession();
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
        });
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
              fetch(`${IDX_API}/api/idx/listings/${id}`)
                .then((r) => r.json())
                .then((d) => d.listing || null)
                .catch(() => null)
            )
          );
          listings = fetched.filter(Boolean);
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: reply, listings },
        ]);
      } catch {
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
    const q = searchParams.get("q");
    if (q && !autoSent.current) {
      autoSent.current = true;
      // Wait for session to be ready, then send
      const timer = setTimeout(() => send(q), 500);
      return () => clearTimeout(timer);
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
        <div>
          <h1 className="text-lg font-bold text-navy">Vale</h1>
          <p className="text-xs text-gray-500">
            AI Real Estate Assistant &bull; Online
          </p>
        </div>
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
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search homes, ask about market trends, schedule a showing..."
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          disabled={loading}
        />
        <VoiceButton
          onTranscript={(text) => send(text)}
          className="rounded-xl border border-gray-300 bg-white p-2.5 text-gray-500 hover:bg-gray-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Send
        </button>
      </form>
     </div>
    </div>
  );
}
