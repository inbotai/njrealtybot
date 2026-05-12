"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/sell", label: "Sell Your Home" },
  { href: "/deals", label: "Deals" },
  { href: "/open-houses", label: "Open Houses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gold">NJ</span> Realty Bot
          </span>
          <span className="hidden text-[10px] leading-tight text-gray-400 sm:block">
            Julio Reynoso | Realty One Group Legend
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-200 transition hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="text-2xl md:hidden"
          aria-label="Toggle menu"
        >
          {open ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-navy md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gray-200 hover:bg-white/5 hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
