"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchListings, parseSearchQuery, type Listing, type ListingsResponse } from "@/lib/api";
import VoiceButton from "./VoiceButton";
import ListingCard from "@/components/ListingCard";
import MLSDisclaimer from "@/components/MLSDisclaimer";

const listingTypes = [
  { label: "All Types", value: "" },
  { label: "For Sale", value: "Residential" },
  { label: "For Rent", value: "Rental" },
  { label: "Multi-Family", value: "Multi-Family" },
  { label: "Commercial", value: "Commercial" },
  { label: "Land", value: "Land" },
];
const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Sold", value: "Sold" },
  { label: "Under Contract", value: "Under Contract" },
  { label: "Coming Soon", value: "Coming Soon" },
];
const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Largest (Sq Ft)", value: "sqft" },
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
    county: searchParams.get("county") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    beds: searchParams.get("beds") || "",
    baths: searchParams.get("baths") || "",
    minSqft: searchParams.get("minSqft") || "",
    maxSqft: searchParams.get("maxSqft") || "",
    propertyType: searchParams.get("propertyType") || "",
    status: searchParams.get("status") || "Active",
    sort: searchParams.get("sort") || "newest",
    page: searchParams.get("page") || "1",
  });

  function doSearch(f: typeof filters) {
    setLoading(true);
    const params: Record<string, string> = {
      status: f.status || "Active",
      limit: "24",
      page: f.page,
      sort: f.sort || "newest",
    };
    if (f.city) params.city = f.city;
    if (f.county) params.county = f.county;
    if (f.q) params.q = f.q;
    if (f.minPrice) params.minPrice = f.minPrice;
    if (f.maxPrice) params.maxPrice = f.maxPrice;
    if (f.beds) params.beds = f.beds;
    if (f.baths) params.baths = f.baths;
    if (f.minSqft) params.minSqft = f.minSqft;
    if (f.maxSqft) params.maxSqft = f.maxSqft;
    if (f.propertyType) params.propertyType = f.propertyType;

    fetchListings(params)
      .then(data => setResults(data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }

  function syncUrl(f: typeof filters) {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v && !(k === "page" && v === "1") && !(k === "status" && v === "Active"))
        params.set(k, v);
    });
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }

  // Search on mount. The parent page.tsx uses key={searchParams} to force
  // remount when URL changes, so this only needs to run once.
  useEffect(() => {
    doSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFilter(key: string, value: string) {
    const next = { ...filters, [key]: value, page: "1" };
    setFilters(next);
    doSearch(next);
    syncUrl(next);
  }

  function goToPage(page: number) {
    const next = { ...filters, page: String(page) };
    setFilters(next);
    doSearch(next);
    syncUrl(next);
  }

  const allListings: Listing[] = results?.data || [];
  const { upcoming, newListings, active } = categorize(allListings);
  const currentPage = Number(filters.page);
  const totalPages = results?.totalPages || 1;
  const locationName = filters.city || filters.county || filters.q;
  const hasCity = !!locationName;
  const typeLabels: Record<string, string> = {
    Rental: "Rentals",
    Commercial: "Commercial Properties",
    Land: "Land & Lots",
    "Multi-Family": "Multi-Family Properties",
  };
  const typeLabel = typeLabels[filters.propertyType] || "Homes for Sale";

  const inputClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  const [heroInput, setHeroInput] = useState("");
  const [heroSearching, setHeroSearching] = useState(false);

  async function handleHeroSearch(text?: string) {
    const q = (text || heroInput).trim();
    if (!q || heroSearching) return;
    setHeroInput("");
    setHeroSearching(true);
    const parsed = await parseSearchQuery(q);
    setHeroSearching(false);

    const next = { ...filters, page: "1" };
    if (parsed.city) next.city = parsed.city;
    if (parsed.county) next.county = parsed.county;
    if (parsed.beds) next.beds = String(parsed.beds);
    if (parsed.baths) next.baths = String(parsed.baths);
    if (parsed.minPrice) next.minPrice = String(parsed.minPrice);
    if (parsed.maxPrice) next.maxPrice = String(parsed.maxPrice);
    if (parsed.propertyType) next.propertyType = parsed.propertyType;
    if (parsed.q) next.q = parsed.q;
    if (parsed.maxPrice) next.sort = "price_desc";
    else if (parsed.minPrice) next.sort = "price_asc";

    setFilters(next);
    doSearch(next);
    syncUrl(next);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero search bar */}
        <div className="mb-6 flex overflow-hidden rounded-xl bg-white shadow-md border border-gray-200">
          <div className="flex items-center pl-4">
            <svg viewBox="0 0 200 200" className="h-8 w-8 flex-shrink-0">
              <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
              <circle cx="100" cy="105" r="52" fill="#4f46e5" />
              <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
              <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
              <path d="M85 118Q100 130 115 118" fill="none" stroke="#ede9fe" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
              <path d="M72 72L80 58L90 68L100 52L110 68L120 58L128 72" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            type="text"
            value={heroInput}
            onChange={e => setHeroInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleHeroSearch(); } }}
            placeholder='Ask Vale... "3 bed house under 500k in Hoboken"'
            className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            disabled={heroSearching}
          />
          <VoiceButton onTranscript={(text) => handleHeroSearch(text)} className="px-2" />
          <button
            onClick={() => handleHeroSearch()}
            disabled={!heroInput.trim() || heroSearching}
            className="bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            {heroSearching ? "..." : "Search"}
          </button>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-navy">
          {hasCity
            ? `${typeLabel} in ${locationName}`
            : `Search ${typeLabel} in New Jersey`}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {results?.total?.toLocaleString() || 0} listings found
        </p>

        {/* Filter bar — row 1 */}
        <div className="mb-3 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="City, Zip, or Address..."
            value={locationName}
            onChange={(e) => {
              const next = { ...filters, city: e.target.value, county: "", q: "", page: "1" };
              setFilters(next);
              doSearch(next);
              syncUrl(next);
            }}
            className={`${inputClass} w-full sm:w-56`}
          />
          <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}
            className={inputClass}>
            {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filters.propertyType}
            onChange={(e) => updateFilter("propertyType", e.target.value)}
            className={inputClass}>
            {listingTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}
            className={inputClass}>
            {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        {/* Filter bar — row 2 */}
        <div className="mb-8 flex flex-wrap gap-3">
          <input type="text" placeholder="Min Price"
            value={filters.minPrice ? `$${Number(filters.minPrice).toLocaleString()}` : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              updateFilter("minPrice", raw);
            }}
            className={`${inputClass} w-32`} />
          <span className="self-center text-sm text-gray-400">to</span>
          <input type="text" placeholder="Max Price"
            value={filters.maxPrice ? `$${Number(filters.maxPrice).toLocaleString()}` : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              updateFilter("maxPrice", raw);
            }}
            className={`${inputClass} w-32`} />
          <select value={filters.beds} onChange={(e) => updateFilter("beds", e.target.value)}
            className={inputClass}>
            <option value="">Beds</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={String(n)}>{n}+ Beds</option>)}
          </select>
          <select value={filters.baths} onChange={(e) => updateFilter("baths", e.target.value)}
            className={inputClass}>
            <option value="">Baths</option>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={String(n)}>{n}+ Baths</option>)}
          </select>
          <input type="number" placeholder="Min Sqft" value={filters.minSqft}
            onChange={(e) => updateFilter("minSqft", e.target.value)}
            className={`${inputClass} w-28`} />
          <input type="number" placeholder="Max Sqft" value={filters.maxSqft}
            onChange={(e) => updateFilter("maxSqft", e.target.value)}
            className={`${inputClass} w-28`} />
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
