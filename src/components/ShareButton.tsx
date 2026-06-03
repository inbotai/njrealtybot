"use client";

import { useState } from "react";

export default function ShareButton({ url, title, size = "md" }: { url: string; title: string; size?: "sm" | "md" }) {
  const [copied, setCopied] = useState(false);
  const px = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard failed */ }
  }

  return (
    <button
      onClick={handleShare}
      className={`${px} flex items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition ${
        copied ? "text-green-500" : "text-gray-400 hover:text-indigo-500"
      }`}
      aria-label="Share listing"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
        </svg>
      )}
    </button>
  );
}
