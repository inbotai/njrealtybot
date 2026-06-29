import Link from "next/link";

/* SEO link arrays — rendered as sr-only for crawlers, not visible to users */
const sellerLinks = [
  { href: "/sell", label: "Sell Your Home" },
  { href: "/my-home", label: "Track My Home Value" },
  { href: "/sell-timing", label: "Sell Now vs Wait" },
  { href: "/property-tax", label: "Tax Appeal" },
  { href: "/comp-alerts", label: "Comp Alerts" },
  { href: "/renovate", label: "Renovation ROI" },
  { href: "/net-proceeds", label: "Net Proceeds" },
  { href: "/market", label: "Market Reports" },
];

const buyerLinks = [
  { href: "/search", label: "Search Homes" },
  { href: "/deals", label: "Deals & Price Drops" },
  { href: "/open-houses", label: "Open Houses" },
  { href: "/alerts", label: "Price Alerts" },
  { href: "/afford", label: "Affordability Calculator" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-gray-200">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Left — BHG logo + agent info */}
          <div className="text-center sm:text-left">
            <img src="/bhg-logo-green.png" alt="Better Homes and Gardens Real Estate" className="h-12 w-auto mx-auto sm:mx-0" />
            <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
              <div className="text-xs leading-tight">
                <p className="font-bold text-gray-900 tracking-wide">GREEN TEAM REALTY</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-900">Julio Reynoso</p>
              <p className="text-[11px] text-gray-500">Licensed Real Estate Agent</p>
              <p className="mt-1 text-[11px] text-gray-400">293 Route 94, Vernon, NJ 07462</p>
            </div>
          </div>

          {/* Center — Contact */}
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-900">Contact</p>
            <p className="mt-2 text-xs text-gray-600">
              <a href="tel:+12015281095" className="hover:text-indigo-600 transition">(201) 528-1095</a>
            </p>
            <p className="mt-1 text-xs text-gray-600">
              <a href="mailto:info@gardenstate.ai" className="hover:text-indigo-600 transition">info@gardenstate.ai</a>
            </p>
            <p className="mt-2 text-[11px] text-gray-400">
              Office: 973.814.7344 | Fax: 845.920.7669
            </p>
          </div>

          {/* Right — Links */}
          <div className="text-center sm:text-right">
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2 text-xs">
              <Link href="/news" className="text-gray-600 hover:text-indigo-600 transition">News</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-indigo-600 transition">Terms of Service</Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition">Contact</Link>
            </div>
          </div>
        </div>

        {/* Platform disclaimer */}
        <div className="mt-8 border-t border-gray-100 pt-4 text-center text-[10px] text-gray-400 space-y-1">
          <p>
            Garden State AI is an AI-powered real estate platform. Property search and listing services are provided
            through IDX (GSMLS/NJMLS) by Better Homes and Gardens | Green Team, 293 Route 94, Vernon, NJ 07462.
          </p>
          <p>All buying and selling services are handled by licensed real estate agents.</p>
          <p>&copy; {new Date().getFullYear()} Garden State AI. All rights reserved.</p>
        </div>

        {/* SEO-only links — hidden from users, visible to crawlers */}
        <nav aria-label="For Sellers" className="sr-only">
          {sellerLinks.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
        <nav aria-label="For Buyers" className="sr-only">
          {buyerLinks.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
