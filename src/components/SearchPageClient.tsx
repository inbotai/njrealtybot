"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchListings, type Listing, type ListingsResponse } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import MLSDisclaimer from "@/components/MLSDisclaimer";

const propertyTypes = [
  "Any", "Residential", "Condo", "Townhouse", "Multi Family", "Land",
];
const sortOptions = [
  { label: "Smart (Recommended)", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Sq Ft", value: "sqft" },
];

/** Categorize listings into priority sections */
function categorize(listings: Listing[]) {
  const now = Date.now();
  const sevenDays = 7 * 24 * 3600_000;
  const upcoming: Listing[] = [];
  const newListings: Listing[] = [];
  const active: Listing[] = [];

  for (const l of listings) {
    const status = (l.mls_status || "").toLowerCase();
    if (status.includes("coming soon") || status.includes("upcoming")) {
      upcoming.push(l);
    } else if (l.list_date && now - new Date(l.list_date).getTime() < sevenDays) {
      newListings.push(l);
    } else {
      active.push(l);
    }
  }
  return { upcoming, newListings, active };
}

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<ListingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
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
        limit: "24",
        page: f.page,
        sort: f.sort || "newest",
      };
      if (f.q) params.q = f.q;
      if (f.city) params.city = f.city;
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      if (f.beds) params.beds = f.beds;
      if (f.baths) params.baths = f.baths;
      if (f.propertyType && f.propertyType !== "Any")
        params.propertyType = f.propertyType;

      const data = await fetchListings(params);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const allListings: Listing[] = results?.data || [];
  const { upcoming, newListings, active } = categorize(allListings);
  const currentPage = Number(filters.page);
  const totalPages = results?.totalPages || 1;
  const hasCity = !!(filters.city || filters.q);

  const inputClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-navy">
          {hasCity
            ? `Homes for Sale in ${filters.city || filters.q}`
            : "Search Homes in New Jersey"}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {results?.total?.toLocaleString() || 0} listings found
        </p>

        {/* Filter bar */}
        <div className="mb-8 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="City or Address..."
            value={filters.city || filters.q}
            onChange={(e) => {
              const v = e.target.value;
              updateFilter("city", v);
              updateFilter("q", "");
            }}
            className={`${inputClass} w-full sm:w-52`}
          />
          <input type="number" placeholder="Min Price" value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className={`${inputClass} w-32`} />
          <input type="number" placeholder="Max Price" value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className={`${inputClass} w-32`} />
          <select value={filters.beds} onChange={(e) => updateFilter("beds", e.target.value)}
            className={inputClass}>
            <option value="">Beds</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={String(n)}>{n}+</option>)}
          </select>
          <select value={filters.baths} onChange={(e) => updateFilter("baths", e.target.value)}
            className={inputClass}>
            <option value="">Baths</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={String(n)}>{n}+</option>)}
          </select>
          <select value={filters.propertyType}
            onChange={(e) => updateFilter("propertyType", e.target.value)}
            className={inputClass}>
            {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}
            className={inputClass}>
            {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : allListings.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg font-medium">No results found</p>
            <p className="mt-1 text-sm">Try adjusting your search criteria or searching a different city.</p>
          </div>
        ) : (
          <>
            {/* Upcoming / Coming Soon */}
            {upcoming.length > 0 && (
              <Section title="🔜 Upcoming Listings" subtitle="Coming soon to market" listings={upcoming} />
            )}

            {/* New Listings (last 7 days) */}
            {newListings.length > 0 && (
              <Section title="🆕 New Listings" subtitle="Listed in the last 7 days" listings={newListings} />
            )}

            {/* Active Listings */}
            {active.length > 0 && (
              <Section
                title={upcoming.length || newListings.length ? "🏠 Active Listings" : ""}
                subtitle=""
                listings={active}
              />
            )}

            {/* If no sections matched but we have listings, show all */}
            {!upcoming.length && !newListings.length && !active.length && allListings.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allListings.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
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

/** Reusable section with title + listing grid */
function Section({ title, subtitle, listings }: {
  title: string; subtitle: string; listings: Listing[];
}) {
  return (
    <div className="mb-10">
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-navy">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </div>
  );
}
