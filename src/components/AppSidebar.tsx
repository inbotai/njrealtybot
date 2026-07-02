"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminAuth";
import {
  Clock, Bell, Wrench, DollarSign, Calculator,
  MapPin, BellRing, KeyRound, Newspaper, Mail,
  ChevronsLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const sidebarLinks: Array<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: "/sell-timing", label: "Sell Now vs Wait", Icon: Clock },
  { href: "/comp-alerts", label: "Comp Alerts", Icon: Bell },
  { href: "/renovate", label: "Renovation ROI", Icon: Wrench },
  { href: "/net-proceeds", label: "Net Proceeds", Icon: DollarSign },
  { href: "/afford", label: "Affordability", Icon: Calculator },
  { href: "/my-home", label: "Track My Home", Icon: MapPin },
  { href: "/alerts", label: "Price Alerts", Icon: BellRing },
  { href: "/fsbo", label: "FSBO Help", Icon: KeyRound },
  { href: "/news", label: "News", Icon: Newspaper },
  { href: "/contact", label: "Contact", Icon: Mail },
];

export default function AppSidebar() {
  const { isAdmin } = useAdmin();
  const [pinned, setPinned] = useState(false);
  const pathname = usePathname();

  if (!isAdmin) return null;

  return (
    <aside
      className={`hidden md:flex fixed top-[64px] left-0 z-40 h-[calc(100vh-64px)] flex-col border-r border-gray-200 bg-white px-2 py-6 transition-all duration-300 overflow-hidden overflow-y-auto group/sidebar ${
        pinned ? "w-52 shadow-lg" : "w-14 hover:w-52 hover:shadow-lg"
      }`}
    >
      <button
        onClick={() => setPinned(!pinned)}
        className="mb-4 flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition"
        title={pinned ? "Collapse sidebar" : "Pin sidebar open"}
      >
        <ChevronsLeft className={`h-5 w-5 shrink-0 transition ${pinned ? "" : "rotate-180"}`} />
        <span className={`text-xs font-medium whitespace-nowrap ${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>
          {pinned ? "Collapse" : "Pin open"}
        </span>
      </button>

      <nav className="flex flex-col gap-0.5">
        {sidebarLinks.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition whitespace-nowrap ${
                active
                  ? "bg-navy/10 text-navy font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-navy"
              }`}
              title={l.label}
            >
              <l.Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className={`${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>
                {l.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={`mt-auto px-2 pt-6 border-t border-gray-200 ${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>
        <p className="text-[10px] text-gray-400">Powered by Vale AI</p>
        <p className="text-[10px] text-gray-400">gardenstate.ai</p>
      </div>
    </aside>
  );
}
