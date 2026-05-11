"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchListings, type Listing, type ListingsResponse } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import MLSDisclaimer from "@/components/MLSDisclaimer";

const propertyTypes = [
  "Any",
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi Family",
];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<ListingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    beds: searchParams.get("beds") || "",
    baths: searchParams.get("baths") || "",
    propertyType: searchParams.get("propertyType") || "Any",
    sort: searchParams.get("sort") || "newest",
    page: searchParams.get("page") || "1",
  });

  const doSearch = useCallback(async (f: typeof filters) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        status: "Active",
        limit: "12",
        page: f.page,
      };
      if (f.q) params.q = f.q;
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      if (f.beds) params.beds = f.beds;
      if (f.baths) params.baths = f.baths;
      if (f.propertyType && f.propertyType !== "Any")
        params.propertyType = f.propertyType;
      if (f.sort) params.sort = f.sort;

      const data = await fetchListings(params);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== "Any" && !(k === "page" && v === "1"))
        params.set(k, v);
    });
    router.replace(`/search?${params.toString()}`, { scroll: false });
    doSearch(filters);
  }, [filters, router, doSearch]);

  function updateFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value, page: "1" }));
  }

  function goToPage(page: number) {
    setFilters((prev) => ({ ...prev, page: String(page) }));
  }

  const listings: Listing[] = results?.data || [];
  const currentPage = Number(filters.page);
  const totalPages = results?.totalPages || 1;

  const inputClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-navy">Search Homes</h1>

        {/* Filter bar */}
        <div className="mb-8 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="City, Zip, Address..."
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
            className={`${inputClass} w-full sm:w-48`}
          />
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className={`${inputClass} w-32`}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className={`${inputClass} w-32`}
          />
          <select
            value={filters.beds}
            onChange={(e) => updateFilter("beds", e.target.value)}
            className={inputClass}
          >
            <option value="">Beds</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>{n}+</option>
            ))}
          </select>
          <select
            value={filters.baths}
            onChange={(e) => updateFilter("baths", e.target.value)}
            className={inputClass}
          >
            <option value="">Baths</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={String(n)}>{n}+</option>
            ))}
          </select>
          <select
            value={filters.propertyType}
            onChange={(e) => updateFilter("propertyType", e.target.value)}
            className={inputClass}
          >
            {propertyTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className={inputClass}
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg font-medium">No results found</p>
            <p className="mt-1 text-sm">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {results?.total?.toLocaleString() || 0} homes found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <MLSDisclaimer />
    </>
  );
}
