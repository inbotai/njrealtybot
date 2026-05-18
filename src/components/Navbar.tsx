"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const mainLinks = [
  { href: "/search", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/market", label: "Market" },
  { href: "/chat", label: "Vale AI" },
];

const moreLinks = [
  { href: "/deals", label: "Deals" },
  { href: "/open-houses", label: "Open Houses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown on outside click
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
    <nav className="sticky top-0 z-50 bg-navy text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          <span className="text-gold">NJ</span> Realty Bot
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm font-medium text-gray-200 transition hover:text-gold">
              {l.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 text-sm font-medium text-gray-200 transition hover:text-gold">
              More
              <svg className={`h-3.5 w-3.5 transition ${moreOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-lg bg-white py-1 shadow-xl">
                {moreLinks.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Agent branding — NJ law: brokerage name must be larger than agent name */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right">
            <p className="text-lg font-bold text-white leading-tight">Realty One Group Legend</p>
            <p className="text-xs text-gray-300">Julio Reynoso</p>
          </div>
          <img src="/realty-one-group-legend-logo.webp" alt="Realty One Group Legend"
            className="h-16 w-auto" />
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="text-2xl lg:hidden" aria-label="Toggle menu">
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-navy lg:hidden">
          {[...mainLinks, ...moreLinks].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm text-gray-200 hover:bg-white/5 hover:text-gold">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
