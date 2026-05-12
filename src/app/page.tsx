import { fetchListings, fetchOpenHouses } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import SearchBar from "@/components/SearchBar";
import MLSDisclaimer from "@/components/MLSDisclaimer";
import RecommendedSection from "@/components/RecommendedSection";
import Link from "next/link";

const features = [
  {
    icon: "\u{1F3E0}",
    title: "AI-Powered Search",
    desc: "Vale, our AI partner, understands what you need and finds the perfect match instantly.",
  },
  {
    icon: "\u{1F4CA}",
    title: "50,000+ Listings",
    desc: "Access every active listing in New Jersey from NJMLS and GSMLS in real-time.",
  },
  {
    icon: "\u26A1",
    title: "Instant Alerts",
    desc: "Get notified the moment a property matching your criteria hits the market.",
  },
];

export default async function HomePage() {
  // Fetch all sections in parallel
  const [activeRes, newRes, upcomingRes, openHouses] = await Promise.all([
    fetchListings({ status: "Active", sort: "newest", limit: "6" }).catch(() => ({ data: [] })),
    fetchListings({ status: "Active", sort: "newest", limit: "6" }).catch(() => ({ data: [] })),
    fetchListings({ status: "Coming Soon", sort: "newest", limit: "6" }).catch(() => ({ data: [] })),
    fetchOpenHouses().catch(() => []),
  ]);

  const active = activeRes.data || [];
  const upcoming = upcomingRes.data || [];
  // Open houses: get unique listing IDs and fetch those listings
  const ohListingIds = [...new Set(openHouses.map((oh: any) => oh.listing_id).filter(Boolean))].slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy py-24 text-center text-white">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            Find Your Dream Home{" "}
            <span className="text-gold">in New Jersey</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Search thousands of homes for sale across the Garden State
          </p>
          <div className="mt-8 flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* New Listings */}
      {active.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-navy">New Listings</h2>
            <Link href="/search?sort=newest" className="text-sm font-medium text-gold hover:underline">
              View All &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming / Coming Soon */}
      {upcoming.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-navy">Upcoming Listings</h2>
            <Link href="/search?status=Coming+Soon" className="text-sm font-medium text-gold hover:underline">
              View All &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Open Houses */}
      {openHouses.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy">Open Houses This Week</h2>
              <Link href="/open-houses" className="text-sm font-medium text-gold hover:underline">
                View All &rarr;
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {openHouses.slice(0, 6).map((oh: any) => (
                <div key={oh.id} className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="font-semibold text-navy">{oh.unparsed_address || oh.address || "Open House"}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {oh.open_house_date} {oh.start_time && `| ${oh.start_time}`}{oh.end_time && ` - ${oh.end_time}`}
                  </p>
                  {oh.remarks && <p className="mt-1 text-xs text-gray-400">{oh.remarks}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Home Value CTA */}
      <section className="bg-gold/10 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-navy">
            What&apos;s Your Home Worth?
          </h2>
          <p className="mt-3 text-gray-600">
            Thinking of selling? Get a free, no-obligation home valuation
            powered by AI.
          </p>
          <Link
            href="/sell"
            className="mt-6 inline-block rounded-lg bg-gold px-8 py-3 font-semibold text-navy transition hover:bg-yellow-500"
          >
            Get Free Valuation
          </Link>
        </div>
      </section>

      {/* Why NJ Realty Bot */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-navy">
          Why NJ Realty Bot?
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl bg-white p-8 text-center shadow-md">
              <div className="text-4xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-navy">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <RecommendedSection />
      <MLSDisclaimer />
    </>
  );
}
