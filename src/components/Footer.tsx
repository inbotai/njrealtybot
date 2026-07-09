"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const toolLinks = [
  { href: "/my-home/log", label: "MyHome Log" },
  { href: "/sell", label: "Home Valuation" },
  { href: "/property-tax", label: "Tax Appeal" },
  { href: "/renovate", label: "Renovation ROI" },
  { href: "/sell-timing", label: "Sell Now vs Wait" },
  { href: "/market", label: "Market Reports" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
  { href: "/chat", label: "Ask Vale" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

/* SEO link arrays — sr-only for crawlers */
const seoSellerLinks = [
  { href: "/sell", label: "Sell Your Home" },
  { href: "/my-home", label: "Track My Home Value" },
  { href: "/net-proceeds", label: "Net Proceeds" },
  { href: "/comp-alerts", label: "Comp Alerts" },
];
const seoBuyerLinks = [
  { href: "/search", label: "Search Homes" },
  { href: "/deals", label: "Deals & Price Drops" },
  { href: "/open-houses", label: "Open Houses" },
  { href: "/alerts", label: "Price Alerts" },
  { href: "/afford", label: "Affordability Calculator" },
];

export default function Footer() {
  const pathname = usePathname();
  const isListingPage = pathname === "/search" || pathname.startsWith("/property/")
    || pathname === "/deals" || pathname === "/open-houses"
    || pathname === "/list" || pathname === "/fsbo";

  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Main footer grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <svg viewBox="0 0 200 200" className="h-8 w-8">
                <circle cx="100" cy="100" r="95" fill="#0f0a1e" />
                <circle cx="100" cy="100" r="72" fill="none" stroke="#f59e0b" strokeWidth="3" />
                <ellipse cx="100" cy="130" rx="45" ry="18" fill="#22c55e" />
                <rect x="75" y="85" width="50" height="40" rx="2" fill="#fbbf24" />
                <polygon points="100,55 65,90 135,90" fill="#ef4444" />
                <rect x="92" y="100" width="16" height="25" rx="1" fill="#0f0a1e" />
              </svg>
              <span className="text-sm font-bold">
                <span className="text-gold">Garden</span>
                <span className="text-gray-900"> State </span>
                <span className="text-indigo-600">AI</span>
              </span>
            </Link>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              New Jersey&apos;s AI-powered platform for homeowners. Track your home, understand your taxes, and sell smarter.
            </p>
            <div className="mt-4 space-y-1">
              <p className="text-xs text-gray-600">
                <a href="tel:+12015281095" className="hover:text-indigo-600 transition">(201) 528-1095</a>
              </p>
              <p className="text-xs text-gray-600">
                <a href="mailto:info@gardenstate.ai" className="hover:text-indigo-600 transition">info@gardenstate.ai</a>
              </p>
            </div>
          </div>

          {/* Tools */}
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Homeowner Tools</p>
            <ul className="mt-3 space-y-2">
              {toolLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-gray-500 hover:text-indigo-600 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Company</p>
            <ul className="mt-3 space-y-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-gray-500 hover:text-indigo-600 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Legal</p>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-gray-500 hover:text-indigo-600 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
            {/* Equal Housing + Realtor logos */}
            <div className="mt-4 flex items-center gap-3">
              <img src="/equal-housing-opportunity.svg" alt="Equal Housing Opportunity" className="h-6 w-auto opacity-60"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <img src="/realtor-logo.svg" alt="Realtor" className="h-6 w-auto opacity-60"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          </div>
        </div>

        {/* Brokerage info — only on listing pages */}
        {isListingPage && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <img src="/bhg-logo-green.png" alt="Better Homes and Gardens Real Estate" className="h-10 w-auto opacity-70" />
              <div className="text-[10px] text-gray-500 leading-relaxed">
                <p>Real estate listing and transaction services provided by <strong>Better Homes and Gardens Real Estate | Green Team</strong>, a licensed New Jersey real estate brokerage. 293 Route 94, Vernon, NJ 07462.</p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimers */}
        <div className="mt-8 border-t border-gray-200 pt-6 space-y-4 text-[10px] text-gray-400 leading-relaxed">
          {/* MLS disclaimer — only on listing pages */}
          {isListingPage && (
            <p>
              The data relating to real estate for sale on this website appears in part through the IDX program of NJMLS and GSMLS.
              Information deemed reliable but not guaranteed. Data provided for consumer&apos;s personal, non-commercial use only.
            </p>
          )}

          {/* Brokerage info — only on listing pages */}
          {isListingPage && (
            <div className="space-y-3">
              <p>
                Property listings provided by GardenState.ai through authorized access to GSMLS and NJMLS.
              </p>
              <p>
                Brokerage: <strong className="text-gray-500">Better Homes and Gardens Real Estate Green Team</strong> — 293 Route 94, Vernon, NJ 07462
                <br />
                Real Estate Agent: <strong className="text-gray-500">Julio Reynoso</strong>
              </p>
              <p>
                GardenState.ai is an independent Artificial Intelligence platform. We are not affiliated with, sponsored by,
                or part of Garden State MLS (GSMLS) or NJMLS.
              </p>
              <p>
                All listings are displayed in accordance with IDX regulations of the State of New Jersey.
              </p>
            </div>
          )}

          {/* Estimates disclaimer — always shown */}
          <p>
            Home valuations, market analyses, tax appeal estimates, and renovation ROI calculations are AI-generated estimates
            for informational purposes only. They are not appraisals, legal advice, or tax advice. Consult a licensed appraiser,
            attorney, or tax professional for official guidance.
          </p>

          {/* Platform disclaimer — always shown */}
          <p>
            gardenstate.ai is a technology platform providing AI-powered tools and market intelligence for homeowners.
            gardenstate.ai is not a licensed real estate brokerage and does not provide real estate brokerage services.
          </p>

          {/* Equal Housing — always shown */}
          <p className="flex items-center gap-2">
            <span>Equal Housing Opportunity.</span>
          </p>

          {/* Copyright */}
          <p>&copy; {new Date().getFullYear()} Garden State AI LLC. All rights reserved.</p>
        </div>
      </div>

      {/* SEO-only links */}
      <nav aria-label="For Sellers" className="sr-only">
        {seoSellerLinks.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </nav>
      <nav aria-label="For Buyers" className="sr-only">
        {seoBuyerLinks.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </nav>
    </footer>
  );
}
