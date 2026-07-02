import type { Metadata } from "next";
import Link from "next/link";
import ValeHelper from "@/components/ValeHelper";

export const metadata: Metadata = {
  title: { absolute: "Selling Your NJ Home Without an Agent? Get AI-Powered Help | Garden State AI" },
  description:
    "Struggling to sell FSBO in New Jersey? Garden State AI gives you AI-powered pricing, negotiation strategy, and licensed agent backup — sell faster, for more money.",
  keywords: ["NJ FSBO", "sell house without agent NJ", "for sale by owner New Jersey", "FSBO help NJ", "AI home selling NJ"],
  alternates: { canonical: "https://gardenstate.ai/fsbo" },
  openGraph: {
    type: "website",
    title: "Selling Your NJ Home Without an Agent? Get AI-Powered Help | Garden State AI",
    description: "Struggling to sell FSBO in New Jersey? Garden State AI gives you AI-powered pricing, negotiation strategy, and licensed agent backup.",
    url: "https://gardenstate.ai/fsbo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Selling Your NJ Home Without an Agent? Get AI-Powered Help | Garden State AI",
    description: "Struggling to sell FSBO in New Jersey? Garden State AI gives you AI-powered pricing, negotiation strategy, and licensed agent backup.",
  },
};

const faqItems = [
  {
    q: "How much does it cost to list with Garden State AI?",
    a: "We charge a competitive commission — typically lower than traditional brokerages — and you only pay at closing. There are zero upfront costs. Your free AI valuation and initial consultation are always complimentary.",
  },
  {
    q: "Do I still need a real estate attorney in NJ?",
    a: "Yes. New Jersey requires an attorney review period (typically 3 business days) for all residential real estate contracts. We help coordinate with your attorney and auto-fill disclosure documents to save time and reduce errors.",
  },
  {
    q: "Can I do everything remotely?",
    a: "Absolutely. From digital onboarding and e-signatures to AI-powered pricing and virtual showings, our entire process can be completed 100% remotely. Your licensed agent is available by phone, text, or video call.",
  },
  {
    q: "What if I already have a buyer?",
    a: "Great — we can still help. We'll run an AI valuation to make sure you're not leaving money on the table, prepare all legally required NJ disclosures, and guide you through the contract and closing process at a reduced commission.",
  },
];

export default function FSBOPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      {/* ── Hero ── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy">
            Selling Your NJ Home{" "}
            <span className="text-gold">
              on Your Own?
            </span>
          </h1>
          <p className="mt-5 text-lg text-gray-500">
            87% of FSBO sellers end up hiring an agent. The ones who don&apos;t leave an average of <strong className="text-navy">$30,000</strong> on the table.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/sell" className="rounded-lg bg-gold px-8 py-3 font-semibold text-navy transition hover:bg-yellow-500">
              Get My Free Valuation
            </Link>
            <Link href="/tax-shock" className="rounded-lg border-2 border-navy px-8 py-3 font-semibold text-navy transition hover:bg-navy/5">
              Check My Property Taxes
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why FSBO Sellers Struggle ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy md:text-3xl">Why FSBO Sellers Struggle</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "Pricing Blind Spots",
                body: "Without MLS data and real comps, most FSBO sellers underprice by 8-12% or overprice and sit on the market for months.",
              },
              {
                icon: "🤝",
                title: "Negotiation Disadvantage",
                body: "Professional buyers and their agents know you don't have representation. They push harder on price, inspections, and concessions.",
              },
              {
                icon: "⚖️",
                title: "Legal Exposure",
                body: "NJ requires property condition disclosures, lead paint disclosures, flood zone notifications, and a 3-day attorney review. Miss one and you're liable.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="text-4xl">{c.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy md:text-3xl">
            What If You Had AI + a Licensed Agent?
          </h2>
          <div className="mt-10 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-navy text-white">
                  <th className="px-4 py-3 font-semibold" />
                  <th className="px-4 py-3 font-semibold">FSBO Alone</th>
                  <th className="px-4 py-3 font-semibold text-gold">With Garden State AI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["Pricing", "Guess from Zillow", "AI + 60K MLS comps + MOD-IV"],
                  ["Negotiation", "You vs their agent", "AI counter-strategy + licensed agent"],
                  ["Legal docs", "Google templates", "Auto-filled CIS, disclosures, Form A-1"],
                  ["Marketing", "Yard sign + Craigslist", "MLS syndication + AI listing description"],
                  ["Showings", "You manage", "Self-guided + agent backup"],
                  ["Cost", "$0 upfront, -$30K avg", "Competitive commission, +$30K avg"],
                ].map(([label, fsbo, ai]) => (
                  <tr key={label} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{label}</td>
                    <td className="px-4 py-3 text-gray-500">{fsbo}</td>
                    <td className="px-4 py-3 font-medium text-indigo-700">{ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy md:text-3xl">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {[
              { n: "1", icon: "📊", title: "Free AI Valuation", desc: "Get your home's real value in 30 seconds" },
              { n: "2", icon: "📝", title: "Digital Onboarding", desc: "Sign docs digitally, 100% remote" },
              { n: "3", icon: "🚀", title: "AI-Powered Marketing", desc: "MLS listing + AI description + virtual staging" },
              { n: "4", icon: "🤝", title: "AI-Assisted Negotiation", desc: "AI analyzes offers and suggests strategy; your licensed agent negotiates and approves everything" },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-3xl">
                  {s.icon}
                </div>
                <div className="mt-2 text-xs font-bold text-gold">STEP {s.n}</div>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-gray-50 py-10">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 text-center sm:grid-cols-2 md:grid-cols-4">
          {[
            ["60,000+", "MLS Listings Analyzed"],
            ["21", "NJ Counties Covered"],
            ["$30K+", "More on Average vs FSBO"],
            ["24/7", "AI Support"],
          ].map(([stat, label]) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-gold">{stat}</div>
              <div className="mt-1 text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy md:text-3xl">Frequently Asked Questions</h2>
          <div className="mt-10 space-y-6">
            {faqItems.map((f) => (
              <details key={f.q} className="group rounded-xl border border-gray-200 p-5">
                <summary className="cursor-pointer list-none font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between">
                    {f.q}
                    <span className="ml-2 text-gold transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vale FSBO Helper + Footer CTA ── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold text-navy">Ready to stop selling alone?</h2>
              <p className="mt-3 text-gray-500">Talk to Vale — she can show you exactly how much more you could get with professional help.</p>
              <Link href="/list" className="mt-6 inline-block rounded-lg bg-gold px-8 py-3 font-semibold text-navy transition hover:bg-yellow-500">
                List My Home Now
              </Link>
              <p className="mt-8 text-xs leading-relaxed text-gray-400">
                All listing services are provided by licensed real estate professionals affiliated with Better Homes and Gardens Real Estate | Green Team, 293 Route 94, Vernon, NJ 07462.
              </p>
            </div>
            <div className="lg:w-80 shrink-0 w-full">
              <ValeHelper
                context="fsbo"
                title="FSBO questions?"
                placeholder="Ask about selling without an agent..."
                initialMessage="Thinking about selling on your own? I can help you understand the pros and cons. FSBO sellers in NJ typically net 15-20% less than agent-listed homes. Want me to show you the numbers for your property?"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
