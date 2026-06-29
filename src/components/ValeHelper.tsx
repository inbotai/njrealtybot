"use client";

import { useState, useRef, useEffect } from "react";

const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";

interface ValeHelperProps {
  context: string;
  title?: string;
  placeholder?: string;
  initialMessage?: string;
}

interface Msg {
  role: "user" | "assistant";
  text: string;
}

export default function ValeHelper({ context, title = "Ask Vale", placeholder = "Ask a question...", initialMessage }: ValeHelperProps) {
  const [messages, setMessages] = useState<Msg[]>(initialMessage ? [{ role: "assistant", text: initialMessage }] : []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${IDX_API}/api/idx/chat/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context }) })
      .then(r => r.json()).then(d => setSessionId(d.sessionId || d.session_id)).catch(() => {});
  }, [context]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || loading || !sessionId) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/chat/message`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: q }), signal: AbortSignal.timeout(60000),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", text: data.reply || data.response || data.text || "Let me look into that." }]);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  if (minimized) {
    return (
      <button onClick={() => setMinimized(false)}
        className="fixed bottom-20 right-6 z-30 lg:static lg:w-full rounded-full lg:rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 transition flex items-center gap-2">
        <svg viewBox="0 0 200 200" className="h-6 w-6 shrink-0">
          <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
          <circle cx="100" cy="105" r="52" fill="#4f46e5" />
          <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
          <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
        </svg>
        <span className="hidden lg:inline">{title}</span>
      </button>
    );
  }

  return (
    <div className="lg:sticky lg:top-20 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 100px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 200 200" className="h-7 w-7 shrink-0">
            <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
            <circle cx="100" cy="105" r="52" fill="#4f46e5" />
            <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
            <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
          </svg>
          <span className="text-sm font-bold text-navy">{title}</span>
        </div>
        <button onClick={() => setMinimized(true)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&minus;</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
              msg.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            disabled={loading} />
          <button onClick={send} disabled={!input.trim() || loading}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-30">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
