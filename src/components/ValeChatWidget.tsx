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

      {/* Chat iframe */}
      {open && (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{ width: 380, height: 580 }}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
            aria-label="Close chat"
          >
            ✕
          </button>
          <iframe
            src={widgetUrl}
            className="h-full w-full border-0"
            title="Chat with Vale"
          />
        </div>
      )}
    </>
  );
}
