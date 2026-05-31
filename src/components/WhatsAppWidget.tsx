"use client";

import { useState, useEffect } from "react";

const WA_LINK = "https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate";

export default function WhatsAppWidget() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setShowTooltip(true), 4000);
    const hide = setTimeout(() => setShowTooltip(false), 8000); // auto-dismiss 4s after showing
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  return (
    <div className="fixed left-5 bottom-5 z-50 flex flex-col items-start gap-2">
      {/* Tooltip — different message for mobile vs desktop */}
      {showTooltip && (
        <div className="relative rounded-xl bg-white px-4 py-3 text-sm text-gray-700 shadow-xl border border-gray-100 max-w-[240px] animate-fade-in">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs hover:bg-gray-300"
            aria-label="Close"
          >
            &times;
          </button>
          {/* Mobile message */}
          <div className="md:hidden">
            <p className="font-semibold text-navy">Take Vale with you</p>
            <p className="mt-1 text-xs text-gray-500">
              Tap to open WhatsApp — search homes, get instant CMAs & schedule showings right from your phone
            </p>
          </div>
          {/* Desktop message */}
          <div className="hidden md:block">
            <p className="font-semibold text-navy">Vale is on WhatsApp too</p>
            <p className="mt-1 text-xs text-gray-500">
              Get property photos, instant valuations & market alerts delivered to your phone
            </p>
          </div>
        </div>
      )}

      {/* WhatsApp button */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onClick={() => setShowTooltip(false)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110 hover:shadow-xl"
      >
        <svg viewBox="0 0 32 32" fill="currentColor" className="h-7 w-7">
          <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm0 29.29a13.35 13.35 0 01-6.8-1.86l-.488-.29-5.064 1.328 1.35-4.94-.317-.505a13.3 13.3 0 01-2.04-7.126c0-7.37 6-13.37 13.37-13.37 7.37 0 13.37 6 13.37 13.37-.007 7.377-6.007 13.383-13.38 13.383v.01zm7.33-10.014c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
        </svg>
      </a>
    </div>
  );
}
