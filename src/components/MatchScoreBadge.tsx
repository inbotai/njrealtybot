"use client";

import { useEffect, useState } from "react";
import { fetchMatchScore } from "@/lib/api";

export default function MatchScoreBadge({ listingId }: { listingId: string }) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const vid = typeof window !== "undefined" ? localStorage.getItem("vale_vid") || "" : "";
    if (!vid) return;
    fetchMatchScore(vid, listingId).then(s => { if (s > 0) setScore(s); }).catch(() => {});
  }, [listingId]);

  if (!score || score < 30) return null;

  const color = score >= 80 ? "text-green-600 bg-green-50 border-green-200"
    : score >= 60 ? "text-blue-600 bg-blue-50 border-blue-200"
    : "text-gray-600 bg-gray-50 border-gray-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      ⚛️ {score}% match
    </span>
  );
}
