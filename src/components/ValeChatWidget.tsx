"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

/** Extract listing UUID from /property/[slug] URLs */
function getListingIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/property\/([a-f0-9-]{36})/);
  return match ? match[1] : null;
}

export default function ValeChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const listingId = getListingIdFromPath(pathname);

  const widgetUrl = listingId
    ? `${IDX_API}/api/idx/chat/widget?listingId=${listingId}`
    : `${IDX_API}/api/idx/chat/widget`;

  return (
    <>
      {/* Floating chat button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat with Vale"
          className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:scale-110 hover:bg-indigo-700 hover:shadow-xl"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
            <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
          </svg>
        </button>
      )}

      {/* Chat panel — larger, Claude-style */}
      {open && (
        <div className="fixed right-0 bottom-0 z-50 flex flex-col bg-white border-l border-gray-200 shadow-2xl"
          style={{ width: 420, height: "100vh" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
            <div className="relative">
              <svg viewBox="0 0 200 200" className="h-9 w-9 drop-shadow">
                <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
                <circle cx="100" cy="105" r="52" fill="#4f46e5" />
                <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
                <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
                <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
                <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">Vale</h2>
              <p className="text-sm text-gray-500">AI Real Estate Assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* iframe */}
          <iframe
            src={widgetUrl}
            className="flex-1 w-full border-0"
            title="Chat with Vale"
          />

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-center text-xs text-gray-400">
              Powered by <span className="font-medium text-indigo-500">Vale</span> from InBot AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
