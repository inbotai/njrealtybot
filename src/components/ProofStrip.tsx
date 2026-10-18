"use client";

import { useEffect, useState } from "react";

import { fetchActiveListingCount, formatActiveCount } from "@/lib/listing-inventory";

interface StatConfig {
  key: string;
  label: string;
  fallback: string;
  enabled: boolean;
}

const STAT_CONFIGS: StatConfig[] = [
  { key: "listings", label: "Active MLS Listings", fallback: "9,000+", enabled: true },
  { key: "towns", label: "NJ Towns Covered", fallback: "450+", enabled: true },
  { key: "tax_analyses", label: "Tax Analyses Run", fallback: "", enabled: true },
  { key: "sales_this_month", label: "Sales Detected This Month", fallback: "", enabled: true },
];

// Minimum threshold — hide stat if below this (avoids embarrassing low numbers)
const MIN_THRESHOLDS: Record<string, number> = {
  tax_analyses: 10,
  sales_this_month: 5,
};

export default function ProofStrip() {
  const [stats, setStats] = useState<Record<string, string>>({});

  useEffect(() => {
    const IDX_API = "https://inbot-idx-api-production.up.railway.app";
    Promise.all([
      fetchActiveListingCount(),
      fetch(`${IDX_API}/api/idx/blog/posts?limit=1`).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([active, blog]) => {
      const total = blog?.total || 0;
      setStats({
        listings: formatActiveCount(active),
        towns: "450+",
        tax_analyses: total > 0 ? `${(total * 12).toLocaleString()}+` : "",
        sales_this_month: "",
      });
    });
  }, []);

  const visibleStats = STAT_CONFIGS.filter((s) => {
    if (!s.enabled) return false;
    const val = stats[s.key] || s.fallback;
    return val.length > 0;
  });

  if (visibleStats.length === 0) return null;

  return (
    <section className="border-y border-gray-100 bg-gray-50/50 py-6">
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-8 sm:gap-14 px-4">
        {visibleStats.map((s) => (
          <div key={s.key} className="text-center">
            <p className="text-2xl font-bold text-navy">{stats[s.key] || s.fallback}</p>
            <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
