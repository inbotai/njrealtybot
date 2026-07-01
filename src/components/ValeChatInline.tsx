"use client";

import { useState, useRef, useEffect } from "react";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ValeChatInline({ listingId }: { listingId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const vid = localStorage.getItem("vale_vid") || "";
    fetch(`${IDX_API}/api/idx/chat/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, visitorId: vid || undefined }),
      signal: AbortSignal.timeout(10000),
    })
      .then(r => { if (!r.ok) throw new Error(`start ${r.status}`); return r.json(); })
      .then(d => {
        setSessionId(d.sessionId);
        if (d.visitorId) localStorage.setItem("vale_vid", d.visitorId);
        setMessages([{ role: "assistant", text: d.greeting }]);
      })
      .catch((err) => { console.error("chat/start failed:", err); setMessages([{ role: "assistant", text: "Hi! I'm Vale. Ask me anything about this property." }]); });
  }, [listingId]);

  // Scroll within the chat container only — don't scroll the whole page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    // Focus input after Vale responds so user can type next message
    if (!loading && messages.length > 0) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, loading]);

  async function send(overrideText?: string) {
    const text = (overrideText || input).trim();
    if (!text || !sessionId || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const r = await fetch(`${IDX_API}/api/idx/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!r.ok) throw new Error(`message ${r.status}`);
      const d = await r.json();
      setMessages(prev => [...prev, { role: "assistant", text: d.reply || d.error || "Something went wrong." }]);
    } catch (err) {
      console.error("chat/message failed:", err);
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Try again." }]);
    }
    setLoading(false);
  }

  return (
    <div data-vale-widget className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-indigo-400/40">
      {/* Animated gradient border glow */}
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-gold opacity-30 blur-sm animate-pulse pointer-events-none" />

      <div className="relative bg-white rounded-2xl overflow-hidden">
        {/* Header — gradient with glow */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-5 py-4">
          {/* Subtle shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
          <div className="relative flex items-center gap-3">
            {/* Vale avatar with pulse ring */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gold/40 animate-ping opacity-50" style={{ animationDuration: "2s" }} />
              <svg viewBox="0 0 200 200" className="relative h-10 w-10 drop-shadow-lg">
                <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
                <circle cx="100" cy="105" r="52" fill="#4f46e5" />
                <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
                <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
                <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
                <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-white tracking-wide">Vale</p>
              <p className="text-[11px] text-indigo-200">AI Real Estate Partner</p>
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-[10px] font-semibold text-green-300">LIVE</span>
            </div>
          </div>
        </div>

        {/* Quick actions — two prominent buttons */}
        <div className="px-4 pt-3 pb-1 space-y-2">
          <button
            onClick={() => {
              send("I'd like to schedule a showing for this property");
              chatContainerRef.current?.closest("[data-vale-widget]")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            disabled={loading || !sessionId}
            className="w-full flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-yellow-400 px-4 py-2.5 text-sm font-bold text-navy hover:from-yellow-400 hover:to-gold transition-all shadow-sm hover:shadow-md disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            Schedule a Showing
          </button>
          <button
            onClick={() => {
              send("What's the market analysis for this area?");
              chatContainerRef.current?.closest("[data-vale-widget]")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            disabled={loading || !sessionId}
            className="w-full flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50/50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-all disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
            Get Market Analysis
          </button>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="h-48 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input — prominent */}
        <div className="flex gap-2 border-t border-gray-200 bg-gray-50/50 p-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Vale anything..."
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 transition-all shadow-sm hover:shadow-md"
          >
            Send
          </button>
        </div>

        <p className="px-4 py-2 text-center text-[9px] text-gray-400 leading-relaxed bg-gray-50/50">
          Powered by <span className="font-semibold text-indigo-500">Vale</span> from Garden State AI
          &nbsp;&middot;&nbsp;
          <a href="/privacy" target="_blank" className="underline hover:text-indigo-400">Privacy</a>
          {" & "}
          <a href="/terms" target="_blank" className="underline hover:text-indigo-400">Terms</a>
        </p>
      </div>
    </div>
  );
}
