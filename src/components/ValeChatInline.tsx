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
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-t-xl bg-indigo-600 px-4 py-3">
        <svg viewBox="0 0 200 200" className="h-8 w-8">
          <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
          <circle cx="100" cy="105" r="52" fill="#4f46e5" />
          <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
          <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
          <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
          <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-white">Vale</p>
          <p className="text-[10px] text-indigo-200">AI Real Estate Partner</p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-indigo-600 text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              {m.text}
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
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-gray-100 p-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about this property..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Send
        </button>
      </div>

      <p className="px-4 pb-2 text-center text-[9px] text-gray-400 leading-relaxed">
        Powered by <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Vale from InBot AI</a>
        <br />
        By chatting, you agree to our{" "}
        <a href="/privacy" target="_blank" className="underline hover:text-indigo-400">Privacy Policy</a>
        {" & "}
        <a href="/terms" target="_blank" className="underline hover:text-indigo-400">Terms</a>.
      </p>
    </div>
  );
}
