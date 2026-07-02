"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminAuth";
import {
  Clock, Bell, Wrench, DollarSign, Calculator,
  MapPin, BellRing, KeyRound, Newspaper, Mail,
  ChevronsLeft, Home, FileText, TrendingUp,
  Search, Building, BarChart3, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Sidebar groups (matches top nav taxonomy) ────────────────

interface SidebarItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: "My Home",
    items: [
      { href: "/my-home/log", label: "MyHome Log", Icon: Home },
      { href: "/my-home", label: "Track My Home", Icon: MapPin },
      { href: "/comp-alerts", label: "Comp Alerts", Icon: Bell },
      { href: "/alerts", label: "Price Alerts", Icon: BellRing },
    ],
  },
  {
    title: "Taxes & Savings",
    items: [
      { href: "/tax-shock", label: "Tax Appeal", Icon: ShieldCheck },
      { href: "/benefits", label: "Benefits Checker", Icon: FileText },
    ],
  },
  {
    title: "Sell",
    items: [
      { href: "/sell", label: "Home Value", Icon: TrendingUp },
      { href: "/sell-timing", label: "Sell Now vs Wait", Icon: Clock },
      { href: "/net-proceeds", label: "Net Proceeds", Icon: DollarSign },
      { href: "/renovate", label: "Renovation ROI", Icon: Wrench },
    ],
  },
  {
    title: "Buy & Rent",
    items: [
      { href: "/search", label: "Search", Icon: Search },
      { href: "/deals", label: "Deals", Icon: Building },
      { href: "/afford", label: "Affordability", Icon: Calculator },
    ],
  },
  {
    title: "Market",
    items: [
      { href: "/market", label: "Reports", Icon: BarChart3 },
      { href: "/news", label: "News", Icon: Newspaper },
    ],
  },
];

// Pages where sidebar is HIDDEN (marketing/landing pages)
const HIDE_ON = ["/", "/about", "/contact", "/privacy", "/terms", "/fsbo", "/list"];

export default function AppSidebar() {
  const { isAdmin } = useAdmin();
  const pathname = usePathname();
  const [pinned, setPinned] = useState(false);

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_pinned");
    if (saved === "true") setPinned(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_pinned", String(pinned));
  }, [pinned]);

  // Hide on marketing pages and for non-admin
  if (!isAdmin) return null;
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <aside
      className={`hidden md:flex fixed top-[64px] left-0 z-40 h-[calc(100vh-64px)] flex-col border-r border-gray-200 bg-white px-2 py-4 transition-all duration-300 overflow-hidden overflow-y-auto group/sidebar ${
        pinned ? "w-52 shadow-lg" : "w-14 hover:w-52 hover:shadow-lg"
      }`}
    >
      <button
        onClick={() => setPinned(!pinned)}
        className="mb-3 flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition"
        title={pinned ? "Collapse" : "Pin open"}
      >
        <ChevronsLeft className={`h-5 w-5 shrink-0 transition ${pinned ? "" : "rotate-180"}`} />
        <span className={`text-xs font-medium whitespace-nowrap ${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>
          {pinned ? "Collapse" : "Pin"}
        </span>
      </button>

      <nav className="flex flex-col gap-1">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title}>
            {/* Section header — visible only when expanded */}
            <p className={`px-2 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${
              pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
            } transition-opacity duration-300`}>
              {group.title}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition whitespace-nowrap ${
                    active
                      ? "bg-navy/10 text-navy font-medium"
                      : "text-gray-500 hover:bg-gray-100 hover:text-navy"
                  }`}
                  title={item.label}
                >
                  <item.Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.5 : 2} />
                  <span className={`${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={`mt-auto px-2 pt-4 border-t border-gray-200 ${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>
        <p className="text-[10px] text-gray-400">gardenstate.ai</p>
      </div>
    </aside>
  );
}
