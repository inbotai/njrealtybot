"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminAuth";

const publicLinks = [
  { href: "/sell", label: "Sell" },
  { href: "/fsbo", label: "FSBO" },
  { href: "/chat", label: "Vale" },
];

const adminLinks = [
  { href: "/search", label: "Buy" },
  { href: "/search?propertyType=Rental", label: "Rentals" },
  { href: "/sell", label: "Sell" },
  { href: "/list", label: "List My Home" },
  { href: "/property-tax", label: "Tax Appeal" },
  { href: "/market", label: "Market" },
  { href: "/deals", label: "Deals" },
];

const moreLinks = [
  { href: "/my-listing", label: "My Listing" },
  { href: "/offers", label: "Offer Analysis" },
  { href: "/sell-timing", label: "Sell Now vs Wait" },
  { href: "/comp-alerts", label: "Comp Alerts" },
  { href: "/renovate", label: "Renovation ROI" },
  { href: "/net-proceeds", label: "Net Proceeds" },
  { href: "/afford", label: "Affordability" },
  { href: "/my-home", label: "Track My Home" },
  { href: "/my-home/log", label: "MyHome Log" },
  { href: "/alerts", label: "Price Alerts" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

/** Open Houses: visible in main nav Thu–Sun, hidden in More Mon–Wed */
function isOpenHouseDay(): boolean {
  const day = new Date().getDay(); // 0=Sun, 4=Thu, 5=Fri, 6=Sat
  return day === 0 || day >= 4;
}

export default function Navbar() {
  const { isAdmin, logout } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const showOpenHouse = isOpenHouseDay();
  const mainLinks = isAdmin ? adminLinks : publicLinks;
  const dynamicMoreLinks = showOpenHouse
    ? moreLinks
    : [{ href: "/open-houses", label: "Open Houses" }, ...moreLinks];
  const isListingPage = pathname === "/search" || pathname.startsWith("/property/")
    || pathname === "/deals" || pathname === "/open-houses"
    || pathname === "/list" || pathname === "/fsbo";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-3">
        {/* Logo with icon */}
        <Link href="/" className="shrink-0 flex items-center gap-2">
          <svg viewBox="0 0 200 200" className="h-9 w-9">
            <circle cx="100" cy="100" r="95" fill="#0f0a1e" />
            <circle cx="100" cy="100" r="72" fill="none" stroke="#f59e0b" strokeWidth="3" />
            <ellipse cx="100" cy="130" rx="45" ry="18" fill="#22c55e" />
            <rect x="75" y="85" width="50" height="40" rx="2" fill="#fbbf24" />
            <polygon points="100,55 65,90 135,90" fill="#ef4444" />
            <rect x="92" y="100" width="16" height="25" rx="1" fill="#0f0a1e" />
            <rect x="80" y="95" width="10" height="10" rx="1" fill="#60a5fa" />
            <rect x="110" y="95" width="10" height="10" rx="1" fill="#60a5fa" />
            <circle cx="60" cy="125" r="12" fill="#22c55e" />
            <rect x="58" y="125" width="4" height="12" rx="1" fill="#92400e" />
            <circle cx="140" cy="125" r="12" fill="#22c55e" />
            <rect x="138" y="125" width="4" height="12" rx="1" fill="#92400e" />
          </svg>
          <span className="text-sm font-bold tracking-tight md:text-base">
            <span className="text-gold">Garden</span>
            <span className="text-gray-900"> State </span>
            <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm font-medium text-gray-900 transition hover:text-indigo-600">
              {l.label}
            </Link>
          ))}
          {isAdmin && showOpenHouse && (
            <Link href="/open-houses"
              className="text-sm font-medium text-gray-900 transition hover:text-indigo-600">
              Open Houses
            </Link>
          )}

          {/* BHG Green Team — only on listing/transaction pages */}
          {isListingPage && (
            <div className="border-l border-gray-200 pl-5 flex items-center gap-2">
              <img src="/bhg-logo-green.png" alt="Better Homes and Gardens Real Estate" className="h-10 w-auto opacity-70" />
              <div className="leading-tight">
                <p className="text-[10px] font-semibold text-gray-500 tracking-wide">GREEN TEAM</p>
                <p className="text-[9px] text-gray-400">REALTY</p>
              </div>
            </div>
          )}

          {/* Admin indicator */}
          {isAdmin && (
            <button onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-600 transition">
              Logout
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="text-2xl text-gray-900 lg:hidden" aria-label="Toggle menu">
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 hover:text-indigo-600">
              {l.label}
            </Link>
          ))}
          {isAdmin && showOpenHouse && (
            <Link href="/open-houses" onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 hover:text-indigo-600">
              Open Houses
            </Link>
          )}
          {isAdmin && (
            <button onClick={() => { logout(); setMobileOpen(false); }}
              className="block w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-gray-50">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
