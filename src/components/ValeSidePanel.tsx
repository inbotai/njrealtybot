"use client";

import { useRef, useEffect, useState } from "react";
import { useVale } from "./ValeProvider";
import { getPhotoUrl, type Listing } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";
import Link from "next/link";
import VoiceButton from "./VoiceButton";

const suggestions = [
  "3 bed house in Hoboken under 500k",
  "What's my home worth?",
  "Show me deals near me",
  "Condos with 2+ baths",
  "Find houses with a pool",
];

export default function ValeSidePanel() {
  const { messages, loading, listings, send, panelOpen } = useVale();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSend() {
    if (!input.trim()) return;
    send(input);
    setInput("");
  }

  if (!panelOpen) return null;

  return (
    <aside className="hidden w-96 flex-shrink-0 md:flex md:flex-col md:sticky md:top-0 md:h-screen border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 bg-indigo-600 px-4 py-3">
        <svg viewBox="0 0 200 200" className="h-8 w-8 flex-shrink-0">
          <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
          <circle cx="100" cy="105" r="52" fill="#4f46e5" />
          <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
          <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
          <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
          <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-white">Vale</p>
          <p className="text-[10px] text-indigo-200">AI Real Estate Partner — Always here to help</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <svg viewBox="0 0 200 200" className="mx-auto h-16 w-16 opacity-30">
              <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
              <circle cx="100" cy="105" r="52" fill="#4f46e5" />
              <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
              <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
              <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-700">Hi! I'm Vale</p>
            <p className="mt-1 text-xs text-gray-400">Ask me anything about NJ real estate</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-indigo-600 text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              {m.text.replace(/\[ID:[a-f0-9-]+\]/gi, "").trim()}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Listing cards inside chat */}
        {listings.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-[10px] font-medium text-gray-400 uppercase">Properties Found</p>
            {listings.slice(0, 6).map(l => (
              <Link key={l.id} href={`/property/${generateSlug(l)}`}
                className="flex gap-2.5 rounded-lg border border-gray-100 bg-white p-2 shadow-sm transition hover:shadow-md hover:border-indigo-200"
              >
                {l.photo_count > 0 && (
                  <img src={getPhotoUrl(l.mls_number)} alt={formatAddress(l)}
                    className="h-16 w-20 flex-shrink-0 rounded-md object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-navy">
                    {l.list_price ? formatPrice(l.list_price) : "Price TBD"}
                  </p>
                  <p className="truncate text-[11px] text-gray-600">{formatAddress(l)}</p>
                  {l.city && <p className="text-[10px] text-gray-400">{l.city}, NJ</p>}
                  <p className="text-[10px] text-gray-500">
                    {l.bedrooms_total ?? "?"} bed / {l.bathrooms_total ?? "?"} bath
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input — always visible at bottom */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about properties..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            disabled={loading}
          />
          <VoiceButton
            onTranscript={(text) => { setInput(text); send(text); }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-[9px] text-gray-400">
          Powered by <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Vale from InBot AI</a>
        </p>
      </div>
    </aside>
  );
}
