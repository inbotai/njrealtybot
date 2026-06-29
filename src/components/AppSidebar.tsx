"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "./AdminAuth";

const sidebarLinks = [
  { href: "/sell-timing", label: "Sell Now vs Wait", icon: "⏱️" },
  { href: "/comp-alerts", label: "Comp Alerts", icon: "🔔" },
  { href: "/renovate", label: "Renovation ROI", icon: "🔨" },
  { href: "/net-proceeds", label: "Net Proceeds", icon: "💵" },
  { href: "/afford", label: "Affordability", icon: "🧮" },
  { href: "/my-home", label: "Track My Home", icon: "📍" },
  { href: "/alerts", label: "Price Alerts", icon: "🔕" },
  { href: "/fsbo", label: "FSBO Help", icon: "🔓" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/contact", label: "Contact", icon: "✉️" },
];

export default function AppSidebar() {
  const { isAdmin } = useAdmin();
  const [pinned, setPinned] = useState(false);

  if (!isAdmin) return null;

  return (
    <aside
      className={`hidden md:flex fixed top-[64px] left-0 z-40 h-[calc(100vh-64px)] flex-col border-r border-gray-200 bg-white px-2 py-6 transition-all duration-300 overflow-hidden overflow-y-auto group/sidebar ${pinned ? "w-52 shadow-lg" : "w-14 hover:w-52 hover:shadow-lg"}`}
    >
      <button
        onClick={() => setPinned(!pinned)}
        className="mb-4 flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition"
        title={pinned ? "Collapse sidebar" : "Pin sidebar open"}
      >
        <svg className={`h-5 w-5 shrink-0 transition ${pinned ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <span className={`text-xs font-medium whitespace-nowrap ${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>
          {pinned ? "Collapse" : "Pin open"}
        </span>
      </button>

      <nav className="flex flex-col gap-0.5">
        {sidebarLinks.map(l => (
          <Link key={l.href} href={l.href}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-navy whitespace-nowrap"
            title={l.label}>
            <span className="text-lg shrink-0">{l.icon}</span>
            <span className={`${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>{l.label}</span>
          </Link>
        ))}
      </nav>

      <div className={`mt-auto px-2 pt-6 border-t border-gray-200 ${pinned ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"} transition-opacity duration-300`}>
        <p className="text-[10px] text-gray-400">Powered by Vale AI</p>
        <p className="text-[10px] text-gray-400">BHG Real Estate | Green Team</p>
      </div>
    </aside>
  );
}
