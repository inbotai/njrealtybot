import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "90-Day Guarantee | Sell Your Home or We Do It Free",
  description:
    "If we don't sell your home within 90 days at the right price, we'll sell it for free — zero commission. Garden State AI's seller guarantee program.",
  keywords: [
    "sell my house NJ guarantee", "90 day guarantee real estate", "no commission NJ",
    "Garden State AI guarantee", "sell home free NJ",
  ],
};

export default function GuaranteePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            We Sell Your Home in 90 Days —{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Or It&apos;s Free
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Zero commission if we don&apos;t deliver. That&apos;s how confident we are.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-3xl font-bold text-gold">1</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Free Home Valuation</h3>
              <p className="mt-2 text-sm text-gray-600">
                We analyze your home using AI + real market data — comps, Zillow, public records, and our 60,000+ listing database. You get a detailed CMA with a suggested price range.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-3xl font-bold text-gold">2</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">We Market Aggressively</h3>
              <p className="mt-2 text-sm text-gray-600">
                AI-generated listing descriptions, virtual staging, social media campaigns, MLS syndication across NJMLS + GSMLS, and Vale handling buyer inquiries 24/7.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-3xl font-bold text-gold">3</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Sold or Free</h3>
              <p className="mt-2 text-sm text-gray-600">
                If your home doesn&apos;t sell within 90 days at the agreed price, we continue working for you at zero commission. You pay nothing until it sells.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">What&apos;s Included</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "AI-powered CMA with comparable sales analysis",
              "Professional listing description (English + Spanish)",
              "Virtual staging for empty rooms",
              "Social media marketing (Instagram + Facebook)",
              "MLS listing on NJMLS + GSMLS (60,000+ listings)",
              "Vale AI handling buyer inquiries 24/7",
              "Weekly seller reports with views, saves, and market data",
              "Net proceeds calculator so you know exactly what you'll walk away with",
              "Monthly home value tracking if you're not ready yet",
              "Neighborhood sale alerts — know when your neighbors sell",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                <span className="mt-0.5 text-gold">&#10003;</span>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">Eligibility &amp; Terms</h2>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm text-amber-800">
              <strong>Terms apply.</strong> The 90-day guarantee is subject to the following conditions:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-amber-700">
              <li>Property must be priced at or within the agreed CMA range</li>
              <li>Seller must cooperate with showings and maintain the property in showing condition</li>
              <li>Guarantee period begins on the MLS listing date</li>
              <li>Applies to residential properties in New Jersey</li>
              <li>Subject to a standard listing agreement</li>
            </ul>
            <p className="mt-4 text-xs text-amber-600">
              Full terms and conditions will be provided in the listing agreement.
              Contact us for complete details and eligibility verification.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-navy via-indigo-900 to-navy py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to Get Started?</h2>
          <p className="mt-3 text-gray-300">Get your free home valuation and see if your property qualifies.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/sell" className="rounded-lg bg-gold px-8 py-3 font-bold text-navy hover:bg-yellow-400">
              Get My Free Valuation
            </Link>
            <a href="https://wa.me/12015281095?text=I%27m%20interested%20in%20the%2090-day%20guarantee" target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-white/30 px-8 py-3 font-bold text-white hover:bg-white/10">
              Message Us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
