"use client";

import Link from "next/link";
import { useState } from "react";
import NavValeButton from "./NavValeButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/sell", label: "Sell Your Home" },
  { href: "/deals", label: "Deals" },
  { href: "/open-houses", label: "Open Houses" },
  { href: "/chat", label: "Chat with Vale" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-gold">NJ</span> Realty Bot
        </Link>

        {/* Desktop nav */}
        <div className="hidden gap-5 lg:flex items-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-200 transition hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
          <NavValeButton />
        </div>

        {/* Broker + Agent — right side, prominent */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right">
            <p className="text-sm font-bold text-white">Julio Reynoso</p>
            <p className="text-xs text-gray-300">Realty One Group Legend</p>
          </div>
          <img src="/realty-one-group-legend-logo.webp" alt="Realty One Group Legend"
            className="h-[74px] w-auto" />
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
