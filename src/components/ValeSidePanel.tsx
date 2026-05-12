"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useVale } from "./ValeProvider";
import VoiceButton from "./VoiceButton";

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

/** Idle animations for Vale's avatar */
const idleAnimations = [
  "animate-vale-blink",
  "animate-vale-look",
  "animate-vale-nod",
];

export default function ValeSidePanel() {
  const { messages, loading, panelOpen, send } = useVale();
  const [input, setInput] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [idleAnim, setIdleAnim] = useState("");
  const pathname = usePathname();

  // Track latest reply
  useEffect(() => {
    const assistantMsgs = messages.filter(m => m.role === "assistant");
    if (assistantMsgs.length > 0) {
      const reply = assistantMsgs[assistantMsgs.length - 1].text
        .replace(/\[ID:[a-f0-9-]+\]/gi, "").trim();
      // Show only first 2 sentences
      const short = reply.split(/[.!?]\s+/).slice(0, 2).join(". ") + (reply.includes(".") ? "." : "");
      setLastReply(short.length > 200 ? short.slice(0, 200) + "..." : short);
      setShowBubble(true);
    }
  }, [messages]);

  // Show context message when navigating
  useEffect(() => {
    const msg = getContextMessage(pathname);
    if (msg && panelOpen) {
      setLastReply(msg);
      setShowBubble(true);
    }
  }, [pathname, panelOpen]);

  // Idle animation loop — subtle movements every 5-8 seconds
  useEffect(() => {
    if (!panelOpen) return;
    const interval = setInterval(() => {
      const anim = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
      setIdleAnim(anim);
      setTimeout(() => setIdleAnim(""), 1500);
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [panelOpen]);

  const handleSend = useCallback((text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    send(q);
  }, [input, send]);

  if (!panelOpen) return null;

  return (
    <div className="hidden md:block fixed bottom-4 right-4 z-40" style={{ width: 320 }}>
      {/* Speech bubble */}
      {showBubble && lastReply && (
        <div className="mb-2 rounded-xl bg-white p-3 shadow-lg border border-gray-200 relative animate-fade-in">
          <button onClick={() => setShowBubble(false)}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-200 text-[10px] text-gray-500 hover:bg-gray-300 flex items-center justify-center">
            ✕
          </button>
          <p className="text-sm text-gray-700 leading-relaxed">{lastReply}</p>
          {/* Bubble arrow */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45" />
        </div>
      )}

      {/* Loading bubble */}
      {loading && (
        <div className="mb-2 rounded-xl bg-white p-3 shadow-lg border border-gray-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-gray-400">Searching...</span>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="mb-2 flex gap-1.5 rounded-xl bg-white p-2 shadow-lg border border-gray-200">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask Vale..."
          className="flex-1 px-2 py-1.5 text-xs outline-none"
          disabled={loading}
        />
        <VoiceButton onTranscript={(text) => handleSend(text)} className="px-1" />
        <button onClick={() => handleSend()} disabled={loading || !input.trim()}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
          Send
        </button>
      </div>

      {/* Vale avatar — animated */}
      <div className="flex items-end justify-end">
        <button
          onClick={() => setShowBubble(b => !b)}
          className={`group relative transition-transform duration-300 hover:scale-110 ${idleAnim}`}
          aria-label="Talk to Vale"
        >
          <svg viewBox="0 0 200 200" className="h-16 w-16 drop-shadow-lg">
            {/* Body */}
            <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
            <circle cx="100" cy="105" r="52" fill="#4f46e5" />
            {/* Eyes — blink animation via CSS */}
            <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" className="vale-eye" />
            <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" className="vale-eye" />
            {/* Smile */}
            <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
            {/* Crown */}
            <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
          </span>
        </button>
      </div>
    </div>
  );
}
