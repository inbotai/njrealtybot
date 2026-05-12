"use client";

import { useEffect, useState } from "react";
import { fetchRecommendations } from "@/lib/api";
import Link from "next/link";

interface Rec { id: string; score: number; address: string; price: number }

export default function RecommendedSection() {
  const [recs, setRecs] = useState<Rec[]>([]);

  useEffect(() => {
    const vid = typeof window !== "undefined" ? localStorage.getItem("vale_vid") || "" : "";
    if (!vid) return;
    fetchRecommendations(vid, 4).then(r => { if (r.length > 0) setRecs(r); }).catch(() => {});
  }, []);

  if (recs.length === 0) return null;

  return (
    <section className="bg-indigo-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Recommended for You</h2>
        <p className="mb-6 text-sm text-gray-500">Based on your browsing preferences</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recs.map(r => (
            <Link key={r.id} href={`/property/${r.id}`}
              className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <p className="truncate text-sm font-medium text-gray-900">{r.address}</p>
              <p className="mt-1 text-lg font-bold text-indigo-600">${r.price.toLocaleString()}</p>
              <span className="mt-2 inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                ⚛️ {r.score}% match
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
