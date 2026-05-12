"use client";

import { useEffect, useState } from "react";
import { recordAndGetDemand, type DemandSignal } from "@/lib/api";

export default function DemandBadge({ listingId }: { listingId: string }) {
  const [demand, setDemand] = useState<DemandSignal | null>(null);

  useEffect(() => {
    const vid = typeof window !== "undefined" ? localStorage.getItem("vale_vid") || "" : "";
    recordAndGetDemand(listingId, vid).then(setDemand).catch(() => {});
  }, [listingId]);

  if (!demand || demand.demandLevel === "low") return null;

  const config = {
    moderate: { bg: "bg-yellow-100 text-yellow-800", icon: "👀", label: `${demand.uniqueVisitors} viewing` },
    high: { bg: "bg-orange-100 text-orange-800", icon: "⚡", label: `High interest · ${demand.uniqueVisitors} buyers` },
    very_high: { bg: "bg-red-100 text-red-800", icon: "🔥", label: `Hot · ${demand.uniqueVisitors} buyers looking` },
  }[demand.demandLevel];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg}`}>
      {config.icon} {config.label}
    </span>
  );
}
