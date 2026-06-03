"use client";

import { useState, useEffect } from "react";
import { polls, type Poll } from "@/data/polls";
import { IDX_PUBLIC_ENABLED } from "@/lib/config";

const STORAGE_PREFIX = "gsai_poll_";
const COLORS = ["bg-red-500", "bg-yellow-500", "bg-blue-400", "bg-blue-600", "bg-gray-400", "bg-emerald-500", "bg-purple-500"];

interface MarketPollProps {
  segment: "sellers" | "buyers" | "renters" | "investors";
}

export default function MarketPoll({ segment }: MarketPollProps) {
  if (!IDX_PUBLIC_ENABLED) return null;
  const poll = polls.find(p => p.segment === segment);
  if (!poll) return null;

  return <PollCard poll={poll} />;
}

function PollCard({ poll }: { poll: Poll }) {
  const storageKey = STORAGE_PREFIX + poll.id;

  const [voted, setVoted] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setVoted(stored);

    const storedVotes = localStorage.getItem(storageKey + "_votes");
    if (storedVotes) {
      setVotes(JSON.parse(storedVotes));
    } else {
      const seed: Record<string, number> = {};
      poll.options.forEach(o => { seed[o.id] = Math.floor(Math.random() * 15) + 5; });
      setVotes(seed);
      localStorage.setItem(storageKey + "_votes", JSON.stringify(seed));
    }
  }, [storageKey, poll.options]);

  function handleVote(id: string) {
    if (voted) return;
    localStorage.setItem(storageKey, id);
    setVoted(id);
    const updated = { ...votes, [id]: (votes[id] || 0) + 1 };
    setVotes(updated);
    localStorage.setItem(storageKey + "_votes", JSON.stringify(updated));
  }

  const total = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-navy">{poll.question}</h3>
      <div className="mt-3 space-y-2">
        {poll.options.map((o, i) => {
          const count = votes[o.id] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const color = COLORS[i % COLORS.length];
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
                <div className={`absolute inset-y-0 left-0 ${color} opacity-10`} style={{ width: `${pct}%` }} />
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
