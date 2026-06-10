"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAdmin } from "./AdminAuth";

const publicLinks = [
  { href: "/sell", label: "Sell" },
  { href: "/chat", label: "Vale" },
];

const adminLinks = [
  { href: "/search", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/chat", label: "Vale" },
];

const moreLinks = [
  { href: "/property-tax", label: "Tax Appeal" },
  { href: "/my-home", label: "Track My Home" },
  { href: "/net-proceeds", label: "Net Proceeds" },
  { href: "/match", label: "Matchmaker" },
  { href: "/staging", label: "Staging" },
  { href: "/renovate", label: "Renovate" },
  { href: "/favorites", label: "Saved" },
  { href: "/afford", label: "Affordability" },
  { href: "/deals", label: "Deals" },
  { href: "/news", label: "Dev News" },
  { href: "/blog", label: "Blog" },
  { href: "/market", label: "Market" },
  { href: "/open-houses", label: "Open Houses" },
  { href: "/alerts", label: "Alerts" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { isAdmin, logout } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const mainLinks = isAdmin ? adminLinks : publicLinks;

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
        <Link href="/" className="group relative text-sm font-bold tracking-tight md:text-base">
          <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">Garden</span>
          <span className="text-white"> State </span>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite_0.5s]">AI</span>
          <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-gold to-indigo-400 transition-all duration-300 group-hover:w-full" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm font-medium text-gray-200 transition hover:text-gold">
              {l.label}
            </Link>
          ))}

          {/* More dropdown — admin only */}
          {isAdmin && (
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
          )}

          {/* Admin indicator */}
          {isAdmin && (
            <button onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-200 transition">
              Logout
            </button>
          )}
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
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm text-gray-200 hover:bg-white/5 hover:text-gold">
              {l.label}
            </Link>
          ))}
          {isAdmin && moreLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm text-gray-200 hover:bg-white/5 hover:text-gold">
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <button onClick={() => { logout(); setMobileOpen(false); }}
              className="block w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-white/5">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
