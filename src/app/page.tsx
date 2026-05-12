import { fetchListings, fetchOpenHouses } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import MLSDisclaimer from "@/components/MLSDisclaimer";
import RecommendedSection from "@/components/RecommendedSection";
import HeroChat from "@/components/HeroChat";
import AIStats from "@/components/AIStats";
import ValeListingsGrid from "@/components/ValeListingsGrid";
import Link from "next/link";

const aiFeatures = [
  {
    icon: "🧠",
    title: "Vale AI Partner",
    desc: "Not a chatbot — a real estate AI that knows every listing, remembers you, and gets smarter with every conversation.",
  },
  {
    icon: "🔮",
    title: "Predict Price Drops",
    desc: "Our AI analyzes days on market, price history, and comps to find properties likely to drop in price before anyone else.",
  },
  {
    icon: "📊",
    title: "Instant CMA Reports",
    desc: "Get a complete market analysis with active, pending, and sold data in seconds — no waiting for an agent to pull comps.",
  },
  {
    icon: "⚛️",
    title: "Smart Matching",
    desc: "Every search, every click, every question teaches Vale what you want. Your results get better without changing a filter.",
  },
  {
    icon: "💰",
    title: "AI Home Valuation",
    desc: "Find out what your home is worth based on real sales data. Not a Zestimate — real MLS comps analyzed by AI.",
  },
  {
    icon: "📱",
    title: "Instant WhatsApp Alerts",
    desc: "New listing matches? Price drops? Vale texts you directly on WhatsApp. No app to download, no account to create.",
  },
];

export default async function HomePage() {
  const [activeRes, upcomingRes, openHouses] = await Promise.all([
    fetchListings({ status: "Active", sort: "newest", limit: "6" }).catch(() => ({ data: [] })),
    fetchListings({ status: "Coming Soon", sort: "newest", limit: "6" }).catch(() => ({ data: [] })),
    fetchOpenHouses().catch(() => []),
  ]);

  const active = activeRes.data || [];
  const upcoming = upcomingRes.data || [];

  return (
    <>
      {/* Hero — AI-First */}
      <section className="relative overflow-hidden bg-navy py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            AI-Powered — Analyzing NJ market in real-time
          </div>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            The First AI-Powered{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
              Real Estate Platform
            </span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl">in New Jersey</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
            Ask Vale anything — search homes, predict prices, get instant market reports,
            or schedule a showing. All powered by AI, backed by real MLS data.
          </p>

          <div className="mt-10">
            <HeroChat />
          </div>

          <div className="mt-12">
            <AIStats />
          </div>
        </div>
      </section>

      {/* Vale's search results — full cards in main content */}
      <ValeListingsGrid />

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

      {/* Upcoming */}
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

      {/* AI Features */}
      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">
              What Makes Us <span className="text-gold">Different</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-400">
              Every other real estate site gives you a search bar and a contact form.
              We give you an AI that actually understands real estate.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map((f) => (
              <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Value CTA */}
      <section className="bg-gold/10 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-navy">
            What&apos;s Your Home Worth?
          </h2>
          <p className="mt-3 text-gray-600">
            Get an AI-powered valuation based on real MLS sales data.
            No waiting, no obligation.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/sell"
              className="rounded-lg bg-gold px-8 py-3 font-semibold text-navy transition hover:bg-yellow-500">
              Get Free Valuation
            </Link>
            <Link href="/deals"
              className="rounded-lg border-2 border-navy px-8 py-3 font-semibold text-navy transition hover:bg-navy hover:text-white">
              Find Deals
            </Link>
          </div>
        </div>
      </section>

      <RecommendedSection />
      <MLSDisclaimer />
    </>
  );
}
