import type { Metadata } from "next";
import Link from "next/link";
import { fetchMarketCities } from "@/lib/api";

export const metadata: Metadata = {
  title: "NJ Real Estate Market Reports by City",
  description: "Real estate market reports for every city in New Jersey. Active listings, recent sales, pricing trends, and free home valuations.",
};

export default async function MarketIndexPage() {
  const cities = await fetchMarketCities();

  return (
    <>
      <section className="bg-navy py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-extrabold md:text-5xl">NJ Market Reports</h1>
          <p className="mt-3 text-gray-300">Real estate market data for {cities.length}+ cities across New Jersey</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cities.map((c) => (
            <Link key={c.city} href={`/market/${encodeURIComponent(c.city)}`}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm transition hover:border-indigo-300 hover:shadow-sm">
              <span className="font-medium text-navy">{c.city}</span>
              <span className="text-xs text-gray-400">{c.count} listings</span>
            </Link>
          ))}
        </div>

        {cities.length === 0 && (
          <p className="py-20 text-center text-gray-400">Loading market data...</p>
        )}

        <div className="mt-12 rounded-2xl bg-indigo-50 p-8 text-center">
          <h2 className="text-xl font-bold text-navy">Thinking of Selling?</h2>
          <p className="mt-2 text-sm text-gray-600">Get a free AI-powered valuation for any property in NJ</p>
          <Link href="/sell" className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Get Free Valuation
          </Link>
        </div>
      </div>
    </>
  );
}
