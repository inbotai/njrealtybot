"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminAuth";

// ── Navigation taxonomy ──────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "My Home",
    items: [
      { href: "/my-home/log", label: "MyHome Log" },
      { href: "/my-home", label: "Track My Home" },
      { href: "/comp-alerts", label: "Comp Alerts" },
      { href: "/alerts", label: "Price Alerts" },
    ],
  },
  {
    label: "Taxes & Savings",
    items: [
      { href: "/tax-shock", label: "Tax Appeal Check" },
      { href: "/appeal", label: "File an Appeal" },
      { href: "/benefits", label: "Benefits Checker" },
    ],
  },
  {
    label: "Sell",
    items: [
      { href: "/sell", label: "Home Value" },
      { href: "/sell-timing", label: "Sell Now vs Wait" },
      { href: "/net-proceeds", label: "Net Proceeds" },
      { href: "/renovate", label: "Renovation ROI" },
      { href: "/list", label: "List My Home" },
      { href: "/fsbo", label: "FSBO Help" },
    ],
  },
  {
    label: "Buy & Rent",
    items: [
      { href: "/search", label: "Search Homes" },
      { href: "/search?propertyType=Rental", label: "Rentals" },
      { href: "/deals", label: "Deals & Price Drops" },
      { href: "/open-houses", label: "Open Houses" },
      { href: "/afford", label: "Affordability" },
    ],
  },
  {
    label: "Market",
    items: [
      { href: "/market", label: "Market Reports" },
      { href: "/news", label: "News" },
    ],
  },
];

// Pages where BHG branding appears (per branding rules)
const BHG_PAGES = ["/search", "/property", "/deals", "/open-houses", "/list", "/fsbo"];

function isBhgPage(pathname: string): boolean {
  return BHG_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// ── Logo SVG ─────────────────────────────────────────────────

function Logo() {
  return (
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
  );
}

// ── Desktop Dropdown ─────────────────────────────────────────

function NavDropdown({
  group, pathname, isOpen, onOpen, onClose,
}: {
  group: NavGroup; pathname: string;
  isOpen: boolean; onOpen: () => void; onClose: () => void;
}) {
  const isActive = group.items.some(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        onClick={onOpen}
        className={`flex items-center gap-1 text-sm font-medium transition ${
          isActive ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
        }`}
      >
        {group.label}
        <svg className={`h-3.5 w-3.5 transition ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-50">
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block px-4 py-2 text-sm transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

export default function Navbar() {
  const { isAdmin, logout } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2">
          <Logo />
          <span className="text-sm font-bold tracking-tight md:text-base">
            <span className="text-gold">Garden</span>
            <span className="text-gray-900"> State </span>
            <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Desktop: 5 dropdown groups */}
        <div className="hidden items-center gap-6 lg:flex">
          {NAV_GROUPS.map((group) => (
            <NavDropdown
              key={group.label}
              group={group}
              pathname={pathname}
              isOpen={openGroup === group.label}
              onOpen={() => setOpenGroup(group.label)}
              onClose={() => setOpenGroup(null)}
            />
          ))}

          {/* BHG branding on transaction pages */}
          {isBhgPage(pathname) && (
            <div className="border-l border-gray-200 pl-5 flex items-center gap-2">
              <img src="/bhg-logo-green.png" alt="Better Homes and Gardens Real Estate" className="h-11 w-auto opacity-70" />
              <div className="leading-tight">
                <p className="text-[11px] font-semibold text-gray-500 tracking-wide">GREEN TEAM</p>
                <p className="text-[10px] text-gray-400">REALTY</p>
              </div>
            </div>
          )}
        </div>

        {/* Right side: auth state */}
        <div className="hidden lg:flex items-center gap-3">
          {isAdmin ? (
            <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600 transition">
              Logout
            </button>
          ) : (
            <span className="text-xs text-gray-400">
              <Link href="/my-home/log" className="hover:text-indigo-600 transition">Sign In</Link>
            </span>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="text-2xl text-gray-900 lg:hidden" aria-label="Toggle menu">
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden max-h-[80vh] overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-6 py-2.5 text-sm ${
                      active ? "text-indigo-600 font-medium bg-indigo-50" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="border-t border-gray-200 mt-2 pt-2 pb-4">
            {isAdmin ? (
              <button onClick={() => { logout(); setMobileOpen(false); }}
                className="block w-full px-4 py-2.5 text-left text-sm text-gray-400">
                Logout
              </button>
            ) : (
              <Link href="/my-home/log" onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm text-indigo-600 font-medium">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
