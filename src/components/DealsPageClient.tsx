"use client";

import { useEffect, useState } from "react";
import { fetchDeals, type DealOpportunity } from "@/lib/api";
import Link from "next/link";

export default function DealsPageClient() {
  const [deals, setDeals] = useState<DealOpportunity[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDeals(c?: string) {
    setLoading(true);
    const d = await fetchDeals(c || undefined, 20);
    setDeals(d);
    setLoading(false);
  }

  useEffect(() => { loadDeals(); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Hidden Deals</h1>
      <p className="mt-2 text-gray-500">
        Our AI analyzes days on market, price reductions, and area comparables to find properties likely to drop in price.
      </p>

      <div className="mt-6 flex gap-3">
        <input
          type="text" value={city} onChange={e => setCity(e.target.value)}
          placeholder="Filter by city (e.g. Hoboken)"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button onClick={() => loadDeals(city)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Search Deals
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-gray-400">Analyzing market data...</p>
      ) : deals.length === 0 ? (
        <p className="mt-8 text-gray-400">No deals found. Try a different city.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {deals.map(d => (
            <Link key={d.listingId} href={`/property/${d.listingId}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{d.address}</h3>
                  <p className="text-sm text-gray-500">{d.city} | MLS# {d.mlsNumber} | {d.daysOnMarket} days on market</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${d.listPrice.toLocaleString()}</p>
                  <p className="text-sm font-medium text-green-600">
                    Predicted: ${d.predictedPrice.toLocaleString()} (-{d.predictedDrop}%)
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  d.probability >= 60 ? "bg-green-100 text-green-800"
                  : d.probability >= 40 ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600"
                }`}>
                  {d.probability}% probability
                </span>
                {d.signals.map((s, i) => (
                  <span key={i} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{s}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
