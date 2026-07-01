"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useVale } from "./ValeProvider";
import VoiceButton from "./VoiceButton";

/** Format chat message: strip IDs, convert markdown links + bold + URLs to HTML */
function formatChatMessage(text: string): string {
  return text
    .replace(/\[ID:[a-f0-9-]+\]/gi, "")
    .trim()
    // Escape HTML first
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Markdown links: [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-600 underline hover:text-indigo-800">$1</a>')
    // Markdown bold: **text**
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // gardenstate.ai links as clickable
    .replace(/(?<!")gardenstate\.ai\/([\w-]+)/g, '<a href="/$1" class="text-indigo-600 underline hover:text-indigo-800">gardenstate.ai/$1</a>')
    // Bare URLs (not already in an href)
    .replace(/(?<!")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="text-indigo-600 underline hover:text-indigo-800">$1</a>')
    // wa.me links
    .replace(/(?<!")(wa\.me\/\d+)/g, '<a href="https://$1" target="_blank" rel="noopener" class="text-indigo-600 underline hover:text-indigo-800">$1</a>');
}

/** Contextual message based on current page */
function getContextMessage(pathname: string): string {
  if (pathname.startsWith("/property/")) {
    return "Nice property! Want to schedule a showing or get a market analysis?";
  }
  if (pathname === "/search") return "I can help you refine your search!";
  if (pathname === "/deals") return "These are AI-detected deals. Want me to find more?";
  if (pathname === "/sell") return "I can give you an instant valuation!";
  if (pathname === "/open-houses") return "Want me to find open houses near you?";
  return "";
}

export default function ValeSidePanel() {
  const { messages, loading, panelOpen, send, closePanel } = useVale();
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Close panel on pages that have their own Vale widget or don't need it
  useEffect(() => {
    if (pathname === "/" || pathname === "/search" || pathname.startsWith("/property/")) closePanel();
  }, [pathname, closePanel]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Show context message when navigating
  useEffect(() => {
    const msg = getContextMessage(pathname);
    if (msg && panelOpen && messages.length === 0) {
      // Context messages are handled by the provider
    }
  }, [pathname, panelOpen, messages.length]);

  const handleSend = useCallback((text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    send(q);
  }, [input, send]);

  // Property pages use their own compact ValeChatInline — never show the full side panel there
  if (!panelOpen || pathname.startsWith("/property/")) return null;

  const panelWidth = expanded ? 480 : 400;

  return (
    <div
      className="hidden md:flex fixed bottom-0 right-0 z-40 flex-col bg-white border-l border-gray-200 shadow-2xl transition-all duration-300"
      style={{ width: panelWidth, height: "calc(100vh - 72px)", top: 72 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
        <div className="relative">
          <svg viewBox="0 0 200 200" className="h-10 w-10 drop-shadow">
            <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
            <circle cx="100" cy="105" r="52" fill="#4f46e5" />
            <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
            <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">Vale</h2>
          <p className="text-sm text-gray-500">AI Real Estate Assistant</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label={expanded ? "Shrink panel" : "Expand panel"}
            title={expanded ? "Shrink" : "Expand"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              {expanded
                ? <><path d="M4 14h6v6" /><path d="M20 10h-6V4" /><path d="M14 10l7-7" /><path d="M3 21l7-7" /></>
                : <><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></>
              }
            </svg>
          </button>
          <button
            onClick={closePanel}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close panel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg viewBox="0 0 200 200" className="h-16 w-16 mx-auto mb-4 opacity-60">
              <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
              <circle cx="100" cy="105" r="52" fill="#4f46e5" />
              <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
              <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
              <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
            </svg>
            <p className="text-base font-medium text-gray-700 mb-1">Hi, I&apos;m Vale!</p>
            <p className="text-sm text-gray-500">Ask me about properties, market trends, or schedule a showing.</p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatChatMessage(msg.text) }}
                />
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm text-gray-400">Searching...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-center gap-2">
          {!voiceActive && (
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Search homes, ask about market trends..."
              className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400"
              disabled={loading}
            />
          )}
          <VoiceButton onTranscript={(text) => handleSend(text)} onRecordingChange={setVoiceActive} className={voiceActive ? "" : "rounded-xl border border-gray-300 bg-white p-3 text-gray-500 hover:bg-gray-50"} />
          {!voiceActive && (
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition">
              Send
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-400 leading-relaxed">
          Powered by <span className="font-medium text-indigo-500">Vale</span> from Garden State AI
          <br />
          By chatting, you consent to receive messages from Garden State AI.
          Msg & data rates may apply. Reply STOP to opt out.{" "}
          <a href="/privacy" target="_blank" className="underline hover:text-indigo-500">Privacy Policy</a>
          {" & "}
          <a href="/terms" target="_blank" className="underline hover:text-indigo-500">Terms</a>.
        </p>
      </div>
    </div>
  );
}
