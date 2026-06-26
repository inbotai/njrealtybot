"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window { twttr?: { widgets: { createTweet: (id: string, el: HTMLElement, opts?: object) => Promise<HTMLElement> } } }
}

export default function TwitterEmbed({ tweetId }: { tweetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    function render() {
      if (window.twttr?.widgets && ref.current) {
        ref.current.innerHTML = "";
        window.twttr.widgets.createTweet(tweetId, ref.current, {
          theme: "light",
          align: "center",
          dnt: true,
        });
      }
    }

    // Load Twitter widget script if not already loaded
    if (!document.getElementById("twitter-wjs")) {
      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    } else {
      render();
    }
  }, [tweetId]);

  return (
    <div ref={ref} className="my-8 flex justify-center">
      {/* Fallback while loading */}
      <a
        href={`https://x.com/i/status/${tweetId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-6 py-4 text-sm text-gray-600 hover:bg-gray-100 transition"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-800" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Loading post from X...
      </a>
    </div>
  );
}
