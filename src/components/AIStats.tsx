"use client";

import { useEffect, useState } from "react";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

export default function AIStats() {
  const [stats, setStats] = useState({ active: 0, total: 0, deals: 0 });

  useEffect(() => {
    Promise.all([
      fetch(`${IDX_API}/api/idx/listings?status=Active&limit=1`)
        .then(r => r.json()).then(d => d.total || d.count || 0).catch(() => 0),
      fetch(`${IDX_API}/api/idx/deals?limit=1`)
        .then(r => r.json()).then(d => d.count || 0).catch(() => 0),
    ]).then(([active, deals]) => {
      setStats({ active, total: active + 37000, deals });
    });
  }, []);

  const items = [
    { value: stats.active > 0 ? stats.active.toLocaleString() : "2,000+", label: "Active Listings", icon: "🏠" },
    { value: stats.total > 0 ? (stats.total / 1000).toFixed(0) + "k+" : "39k+", label: "Total MLS Records", icon: "📊" },
    { value: "2", label: "MLS Sources (NJMLS + GSMLS)", icon: "🔗" },
    { value: "15min", label: "Data Refresh Rate", icon: "⚡" },
    { value: stats.deals > 0 ? String(stats.deals) : "—", label: "AI-Detected Deals", icon: "🔮" },
    { value: "24/7", label: "Vale AI Available", icon: "🤖" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(item => (
        <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 p-4 text-center backdrop-blur">
          <div className="text-lg">{item.icon}</div>
          <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
          <p className="mt-0.5 text-[10px] text-gray-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
