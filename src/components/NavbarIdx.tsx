"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * IDX subdomain navbar — brokerage branded.
 * Shows on idxlistings.gardenstate.ai.
 * Placeholder: [BROKERAGE NAME] until broker is confirmed.
 */

const links = [
  { href: "/search", label: "Buy" },
  { href: "/open-houses", label: "Open Houses" },
  { href: "/deals", label: "Deals" },
  { href: "/chat", label: "Vale" },
];

export default function NavbarIdx() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white text-gray-900 shadow-sm border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brokerage logo placeholder */}
        <Link href="/" className="flex items-center gap-3">
          {/* Replace with brokerage logo image when ready */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white text-xs font-bold">
            IDX
          </div>
          <div>
            <p className="text-sm font-bold text-navy">[Brokerage Name]</p>
            <p className="text-[10px] text-gray-400">Powered by Garden State AI</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm font-medium text-gray-600 transition hover:text-navy">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="text-2xl md:hidden" aria-label="Toggle menu">
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
