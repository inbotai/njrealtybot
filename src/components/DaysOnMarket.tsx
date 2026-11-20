"use client";

import { useEffect, useState } from "react";

/**
 * Days on market depend on the clock. The cached HTML renders nothing; the
 * badge appears after hydration so a regeneration is not a new ISR write.
 */
export default function DaysOnMarket({ listDate }: { listDate: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const listed = Date.parse(listDate);
      if (!Number.isFinite(listed)) return;
      const days = Math.floor((Date.now() - listed) / 86_400_000);
      setLabel(days <= 0 ? "New today" : `${days}d on market`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [listDate]);

  if (!label) return null;

  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
      {label}
    </span>
  );
}
