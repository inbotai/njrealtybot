import { fetchListings } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import SearchBar from "@/components/SearchBar";
import MLSDisclaimer from "@/components/MLSDisclaimer";
import Link from "next/link";

const features = [
  {
    icon: "\u{1F916}",
    title: "AI-Powered Search",
    desc: "Our intelligent assistant understands what you need and finds the perfect match instantly.",
  },
  {
    icon: "\u{1F3E0}",
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
  let listings: import("@/lib/api").Listing[] = [];
  try {
    const res = await fetchListings({
      status: "Active",
      sort: "newest",
      limit: "6",
    });
    listings = res.data || [];
  } catch {
    /* API may be unavailable */
  }

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

      {/* Featured Listings */}
      {listings.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-navy">Featured Listings</h2>
            <Link
              href="/search"
              className="text-sm font-medium text-gold hover:underline"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
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
            Thinking of selling? Get a free, no-obligation home valuation from
            our team.
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
            <div
              key={f.title}
              className="rounded-xl bg-white p-8 text-center shadow-md"
            >
              <div className="text-4xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-navy">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <MLSDisclaimer />
    </>
  );
}
