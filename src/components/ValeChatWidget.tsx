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

          <div className="px-4 py-2 border-t border-gray-100 bg-gradient-to-r from-[#25D366]/5 to-gray-50">
            <a
              href="https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#128C7E] transition hover:bg-[#25D366]/20"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
              </svg>
              Chat on WhatsApp for photos, alerts & instant responses
            </a>
          </div>
        </div>
      )}
    </>
  );
}
