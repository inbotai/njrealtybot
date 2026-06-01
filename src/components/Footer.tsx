import Link from "next/link";

const quickLinks = [
  { href: "/sell", label: "Sell Your Home" },
  { href: "/chat", label: "Chat with Vale" },
  { href: "/alerts", label: "Price Alerts" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-navy text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Garden State AI */}
          <div>
            <h3 className="text-base font-bold text-white">
              <span className="text-gold">Garden</span> State <span className="text-indigo-400">AI</span>
            </h3>
            <p className="mt-2 text-sm">
              The Most Advanced Real Estate AI in NJ.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gold transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 font-semibold text-white">Contact</h4>
            <p className="text-sm">
              Vale, our AI partner, is available 24/7.
            </p>
            <p className="mt-2 text-sm">
              <a href="tel:+12015281095" className="text-gold hover:underline">(201) 528-1095</a>
              {" | "}
              <a href="mailto:info@gardenstate.ai" className="text-gold hover:underline">info@gardenstate.ai</a>
            </p>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-10 rounded-xl border border-[#25D366]/30 bg-gradient-to-r from-[#25D366]/15 via-[#25D366]/5 to-[#25D366]/15 px-6 py-5">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-white">
                Chat with Vale on WhatsApp for the best experience
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Instant valuations, property photos, market alerts & more — right on your phone
              </p>
            </div>
            <a
              href="https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20bd5a] hover:shadow-lg"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4">
                <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
              </svg>
              Message Vale
            </a>
          </div>
        </div>

        {/* Developed by */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-600">
            Developed by{" "}
            <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition">
              InBot AI
            </a>
          </p>
        </div>

        {/* Platform disclaimer */}
        <div className="mt-6 border-t border-white/10 pt-4 text-center text-[10px] text-gray-500 space-y-1">
          <p>
            GardenState.ai is an Artificial Intelligence platform for the real estate industry.
            Property search and listing services are provided through IDX (GSMLS/NJMLS) by licensed real estate agents.
          </p>
          <p>
            GardenState.ai is not a brokerage. All buying and selling services are handled by authorized agents.
          </p>
          <p>&copy; {new Date().getFullYear()} Garden State AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
