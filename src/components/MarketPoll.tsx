"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "gsai_poll_vote";
const options = [
  { id: "hot", label: "Hot — great time to sell", icon: "🔥", color: "bg-red-500" },
  { id: "warm", label: "Warm — steady market", icon: "☀️", color: "bg-yellow-500" },
  { id: "cool", label: "Cooling down", icon: "🌤️", color: "bg-blue-400" },
  { id: "cold", label: "Cold — tough for sellers", icon: "❄️", color: "bg-blue-600" },
  { id: "unsure", label: "Not sure", icon: "🤔", color: "bg-gray-400" },
];

// Simple local vote tracking (no backend needed for MVP)
function getVotes(): Record<string, number> {
  // Seed with realistic NJ market sentiment distribution
  return { hot: 34, warm: 47, cool: 12, cold: 3, unsure: 8 };
}

export default function MarketPoll() {
  const [voted, setVoted] = useState<string | null>(null);
  const [votes, setVotes] = useState(getVotes());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setVoted(stored);
  }, []);

  function handleVote(id: string) {
    if (voted) return;
    localStorage.setItem(STORAGE_KEY, id);
    setVoted(id);
    setVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  const total = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-navy">How do you feel about the NJ market right now?</h3>
      <div className="mt-3 space-y-2">
        {options.map(o => {
          const count = votes[o.id] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={o.id}
              onClick={() => handleVote(o.id)}
              disabled={!!voted}
              className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition ${
                voted === o.id ? "border-gold bg-gold/5" : voted ? "border-gray-200" : "border-gray-200 hover:border-gold/50"
              }`}
            >
              {voted && (
                <div className={`absolute inset-y-0 left-0 ${o.color} opacity-10`} style={{ width: `${pct}%` }} />
              )}
              <div className="relative flex items-center justify-between">
                <span>{o.icon} {o.label}</span>
                {voted && <span className="text-xs font-medium text-gray-500">{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      {voted && (
        <p className="mt-2 text-xs text-gray-400 text-center">{total} votes · Thank you for voting!</p>
      )}
    </div>
  );
}
