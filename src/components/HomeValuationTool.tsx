"use client";

import { useState } from "react";
import { fetchPricingEstimate, fetchCMA, type PricingEstimate } from "@/lib/api";

export default function HomeValuationTool() {
  const [city, setCity] = useState("");
  const [beds, setBeds] = useState("");
  const [sqft, setSqft] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [estimate, setEstimate] = useState<PricingEstimate | null>(null);
  const [cma, setCma] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!city) return;
    setLoading(true);
    setError("");
    setEstimate(null);
    setCma("");
    try {
      const [est, report] = await Promise.all([
        fetchPricingEstimate({
          city, bedrooms: beds ? parseInt(beds) : undefined,
          sqft: sqft ? parseInt(sqft) : undefined,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
        }),
        fetchCMA(city, beds ? parseInt(beds) : undefined),
      ]);
      setEstimate(est);
      setCma(report);
    } catch {
      setError("Unable to generate estimate. Try a different city.");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Instant Home Valuation</h3>
      <p className="mt-1 text-sm text-gray-500">Get an AI estimate based on recent sales in your area</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input type="text" value={city} onChange={e => setCity(e.target.value)} required
          placeholder="City (e.g. Hoboken)" className="w-full rounded-lg border px-3 py-2 text-sm" />
        <div className="grid grid-cols-3 gap-2">
          <input type="number" value={beds} onChange={e => setBeds(e.target.value)}
            placeholder="Beds" className="rounded-lg border px-3 py-2 text-sm" />
          <input type="number" value={sqft} onChange={e => setSqft(e.target.value)}
            placeholder="Sq Ft" className="rounded-lg border px-3 py-2 text-sm" />
          <input type="number" value={yearBuilt} onChange={e => setYearBuilt(e.target.value)}
            placeholder="Year Built" className="rounded-lg border px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Analyzing..." : "Get Free Estimate"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {estimate && (
        <div className="mt-5 rounded-lg bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-800">Estimated Value</p>
          <p className="text-3xl font-bold text-indigo-900">${estimate.estimatedValue.toLocaleString()}</p>
          <p className="mt-1 text-sm text-indigo-600">
            Range: ${estimate.lowRange.toLocaleString()} — ${estimate.highRange.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-indigo-500">
            Confidence: {estimate.confidence} | Based on {estimate.comparables} recent sales | Avg ${estimate.pricePerSqft}/sqft
          </p>
        </div>
      )}

      {cma && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View Full Market Analysis
          </summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700 whitespace-pre-wrap">
            {cma}
          </pre>
        </details>
      )}
    </div>
  );
}
