import type { Metadata } from "next";
import Link from "next/link";
import { fetchMarketReport, getPhotoUrl } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const name = decodeURIComponent(city).replace(/-/g, " ");
  return {
    title: `${name} NJ Real Estate Market Report | Homes for Sale`,
    description: `${name}, NJ housing market: average home prices, recent sales, active listings, and market trends. Free home valuation available.`,
    keywords: [`${name} homes for sale`, `${name} NJ real estate`, `${name} market report`, `sell house ${name} NJ`],
  };
}

export default async function MarketPage({ params }: Props) {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/-/g, " ");
  const report = await fetchMarketReport(cityName);

  if (!report || (!report.stats.activeCount && !report.stats.soldCount)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-navy">No Market Data for {cityName}</h1>
        <p className="mt-3 text-gray-500">Try searching for a different city.</p>
        <Link href="/search" className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700">Search All Listings</Link>
      </div>
    );
  }

  const { stats } = report;
  const trendIcon = stats.trend === "up" ? "📈" : stats.trend === "down" ? "📉" : "➡️";
  const trendLabel = stats.trend === "up" ? "Prices Trending Up" : stats.trend === "down" ? "Prices Trending Down" : "Prices Stable";

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">{cityName}, NJ</h1>
          <p className="mt-2 text-xl text-gold">Real Estate Market Report</p>
          <p className="mt-2 text-sm text-gray-400">Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        </div>
      </section>

      {/* Stats grid */}
      <section className="border-b py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          <StatCard label="Active Listings" value={stats.activeCount} />
          <StatCard label="Sold (3 months)" value={stats.soldCount} />
          <StatCard label="Avg Sale Price" value={`$${stats.avgSoldPrice.toLocaleString()}`} />
          <StatCard label="Median Sale Price" value={`$${stats.medianSoldPrice.toLocaleString()}`} />
          <StatCard label="Avg List Price" value={`$${stats.avgActivePrice.toLocaleString()}`} />
          <StatCard label="Avg $/Sqft" value={stats.avgPricePerSqft ? `$${stats.avgPricePerSqft}` : "N/A"} />
          <StatCard label="Under Contract" value={stats.pendingCount} />
          <StatCard label="Market Trend" value={`${trendIcon} ${trendLabel}`} />
        </div>
        {stats.absorptionMonths && (
          <p className="mx-auto mt-4 max-w-5xl px-4 text-center text-sm text-gray-500">
            {parseFloat(stats.absorptionMonths) < 3 ? "Seller's Market" : parseFloat(stats.absorptionMonths) > 6 ? "Buyer's Market" : "Balanced Market"} — {stats.absorptionMonths} months of inventory
          </p>
        )}
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Recent Sales */}
        {report.recentSales.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy">Recent Sales in {cityName}</h2>
            <p className="mt-1 text-sm text-gray-500">Last 3 months</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.recentSales.map((l: any) => (
                <ListingCard key={l.id} listing={l} type="sold" />
              ))}
            </div>
          </section>
        )}

        {/* Active Listings */}
        {report.activeListings.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy">Homes for Sale in {cityName}</h2>
                <p className="mt-1 text-sm text-gray-500">{stats.activeCount} active listings</p>
              </div>
              <Link href={`/search?city=${encodeURIComponent(cityName)}`}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                View All
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.activeListings.map((l: any) => (
                <ListingCard key={l.id} listing={l} type="active" />
              ))}
            </div>
          </section>
        )}

        {/* CMA CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-navy to-indigo-900 p-8 text-center text-white md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Own a Home in {cityName}?</h2>
          <p className="mt-3 text-gray-300">Find out what it&apos;s worth in today&apos;s market. Free, instant, no obligation.</p>
          <Link href={`/chat?q=${encodeURIComponent(`CMA for my home in ${cityName}`)}`}
            className="mt-6 inline-block rounded-xl bg-gold px-8 py-3 font-bold text-navy hover:bg-yellow-400">
            Get My Free Home Valuation
          </Link>
          <p className="mt-3 text-sm text-gray-400">
            Or message Vale on WhatsApp: <a href="https://wa.me/12015281095" className="text-gold hover:underline">+1 (201) 528-1095</a>
          </p>
        </section>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm text-center">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ListingCard({ listing, type }: { listing: any; type: "sold" | "active" }) {
  const photo = listing.primary_photo_url || (listing.photo_count > 0 ? getPhotoUrl(listing.mls_number) : null);
  const price = type === "sold" ? (listing.close_price || listing.list_price) : listing.list_price;
  const baths = (listing.bathrooms_full || 0) + (listing.bathrooms_half || 0) || listing.bathrooms_total || 0;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm border">
      <div className="relative aspect-[4/3] bg-gray-100">
        {photo ? (
          <img src={photo} alt={listing.unparsed_address} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">No Photo</div>
        )}
        <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-bold text-white ${type === "sold" ? "bg-red-600" : "bg-green-600"}`}>
          {type === "sold" ? "Sold" : "Active"}
        </span>
      </div>
      <div className="p-3">
        <p className="text-lg font-bold text-navy">{formatPrice(price || 0)}</p>
        <p className="text-xs text-gray-600 truncate">{listing.unparsed_address}</p>
        <div className="mt-1 flex gap-2 text-xs text-gray-500">
          {listing.bedrooms_total && <span>{listing.bedrooms_total} Beds</span>}
          {baths > 0 && <span>{baths} Baths</span>}
          {listing.living_area && listing.living_area > 100 && <span>{listing.living_area.toLocaleString()} Sqft</span>}
        </div>
        {type === "sold" && listing.close_date && (
          <p className="mt-1 text-xs text-gray-400">Sold: {listing.close_date}</p>
        )}
      </div>
    </div>
  );
}
