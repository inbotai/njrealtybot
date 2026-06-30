"use client";

import { useEffect } from "react";
import { useVale } from "./ValeProvider";

/** Sets the current listing context and shows a CTA to chat */
export default function PropertyChatTrigger({ listingId, address, price }: {
  listingId: string; address: string; price: string;
}) {
  const { setCurrentListing, openPanel, send, messages } = useVale();

  useEffect(() => {
    setCurrentListing(listingId);
    return () => setCurrentListing(null);
  }, [listingId, setCurrentListing]);

  function startChat() {
    openPanel();
    if (messages.length === 0) {
      send(`Tell me about the property at ${address} listed at ${price}`);
    }
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 200 200" className="h-10 w-10 flex-shrink-0">
          <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
          <circle cx="100" cy="105" r="52" fill="#4f46e5" />
          <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
          <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
          <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
          <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <p className="text-sm font-bold text-indigo-900">Ask Vale about this property</p>
          <p className="text-xs text-indigo-600">Schedule a showing, get comps, or ask anything</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <button onClick={startChat}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition">
          Chat with Vale about this property
        </button>
        <button onClick={() => { openPanel(); send("I'd like to schedule a showing for this property"); }}
          className="w-full rounded-lg border border-indigo-300 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition">
          Schedule a Showing
        </button>
        <button onClick={() => { openPanel(); send("What's the market analysis for this area?"); }}
          className="w-full rounded-lg border border-indigo-300 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition">
          Get Market Analysis
        </button>
      </div>
      <p className="mt-3 text-center text-[9px] text-gray-400 leading-relaxed">
        Powered by <a href="https://gardenstate.ai" className="text-indigo-400 hover:underline">Vale</a> from Garden State AI
        <br />
        By chatting, you agree to our{" "}
        <a href="/privacy" target="_blank" className="underline hover:text-indigo-400">Privacy Policy</a>
        {" & "}
        <a href="/terms" target="_blank" className="underline hover:text-indigo-400">Terms</a>.
      </p>
    </div>
  );
}
