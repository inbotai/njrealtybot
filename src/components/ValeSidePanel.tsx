"use client";

import { useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useVale } from "./ValeProvider";
import { getPhotoUrl } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";
import Link from "next/link";
import VoiceButton from "./VoiceButton";

/** Get a contextual message based on the current page */
function getContextMessage(pathname: string): string {
  if (pathname.startsWith("/property/")) {
    return "Nice property! Want more details, schedule a showing, or get a market analysis?";
  }
  if (pathname === "/search") {
    return "Looking for something specific? I can search by city, price, bedrooms, or even lifestyle.";
  }
  if (pathname === "/deals") {
    return "These are AI-detected deals — properties likely to drop in price. Want me to find more?";
  }
  if (pathname === "/sell") {
    return "Thinking of selling? I can give you an instant home valuation based on recent sales.";
  }
  if (pathname === "/open-houses") {
    return "Want me to find open houses near a specific area?";
  }
  return "Hi! I'm Vale. Ask me anything about NJ real estate.";
}

export default function ValeSidePanel() {
  const { messages, loading, listings, send, panelOpen } = useVale();
  const [input, setInput] = useState("");
  const [lastReply, setLastReply] = useState("");
  const pathname = usePathname();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Track Vale's latest reply
  useEffect(() => {
    const assistantMsgs = messages.filter(m => m.role === "assistant");
    if (assistantMsgs.length > 0) {
      setLastReply(assistantMsgs[assistantMsgs.length - 1].text.replace(/\[ID:[a-f0-9-]+\]/gi, "").trim());
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastReply, listings]);

  if (!panelOpen) return null;

  const contextMsg = getContextMessage(pathname);
  const hasConversation = messages.length > 1; // more than just greeting

  function handleSend(text?: string) {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    send(q);
  }

  return (
    <aside className="hidden w-80 flex-shrink-0 md:flex md:flex-col md:sticky md:top-0 md:h-screen border-l border-gray-200 bg-white">
      {/* Vale avatar + context message */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 200 200" className="h-10 w-10 flex-shrink-0">
            <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
            <circle cx="100" cy="105" r="52" fill="#4f46e5" />
            <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
            <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-xs font-bold text-gray-800">Vale</p>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              {lastReply || contextMsg}
            </p>
          </div>
        </div>
      </div>

      {/* Quick action buttons — contextual */}
      {!hasConversation && pathname.startsWith("/property/") && (
        <div className="px-4 pb-3 space-y-2">
          <button onClick={() => handleSend("Schedule a showing for this property")}
            className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition">
            Schedule a Showing
          </button>
          <button onClick={() => handleSend("What's the market analysis for this area?")}
            className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
            Market Analysis
          </button>
          <button onClick={() => handleSend("Show me similar properties nearby")}
            className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
            Similar Properties
          </button>
        </div>
      )}

      {!hasConversation && !pathname.startsWith("/property/") && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {["Houses in Hoboken", "What's my home worth?", "Find deals", "Condos under 400k"].map(s => (
            <button key={s} onClick={() => handleSend(s)}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Listing results from Vale */}
      {listings.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2">
          <p className="text-[10px] font-medium text-gray-400 uppercase">Properties Found</p>
          {listings.slice(0, 8).map(l => (
            <Link key={l.id} href={`/property/${generateSlug(l)}`}
              className="flex gap-2 rounded-lg border border-gray-100 p-2 transition hover:border-indigo-200 hover:shadow-sm"
            >
              {l.photo_count > 0 && (
                <img src={getPhotoUrl(l.mls_number)} alt={formatAddress(l)}
                  className="h-14 w-18 flex-shrink-0 rounded-md object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-navy">
                  {l.list_price ? formatPrice(l.list_price) : "TBD"}
                </p>
                <p className="truncate text-[11px] text-gray-600">{formatAddress(l)}</p>
                <p className="text-[10px] text-gray-400">
                  {l.bedrooms_total ?? "?"} bd / {l.bathrooms_total ?? "?"} ba
                  {l.city ? ` · ${l.city}` : ""}
                </p>
              </div>
            </Link>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
            <span>Vale is thinking...</span>
          </div>
        </div>
      )}

      {/* Spacer */}
      {listings.length === 0 && <div className="flex-1" />}

      {/* Input — always at bottom */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask Vale..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-400"
            disabled={loading}
          />
          <VoiceButton onTranscript={(text) => handleSend(text)} />
          <button onClick={() => handleSend()} disabled={loading || !input.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
            Send
          </button>
        </div>
        <p className="mt-1.5 text-center text-[8px] text-gray-300">
          Powered by <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline">Vale from InBot AI</a>
        </p>
      </div>
    </aside>
  );
}
