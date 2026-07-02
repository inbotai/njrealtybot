"use client";

import SaveToLogCTA from "./SaveToLogCTA";

/**
 * MyHome Log landing page — shows previews of what gets saved,
 * then the sign-up CTA. Convinces the homeowner with concrete examples.
 */

const PREVIEW_SECTIONS = [
  {
    icon: "📊",
    title: "Home Value Tracking",
    description: "See your home's estimated value update monthly. Track appreciation over time.",
    example: {
      label: "Your Home's Value",
      value: "$685,000",
      detail: "+$23,000 since you started tracking (6 months)",
      color: "emerald",
    },
  },
  {
    icon: "🏠",
    title: "Tax Assessment History",
    description: "Every tax analysis saved. Know if you're overpaying — and the evidence to prove it.",
    example: {
      label: "Assessment vs Market",
      value: "Over-assessed by $47,000",
      detail: "Potential savings: $1,200/year",
      color: "red",
    },
  },
  {
    icon: "🔨",
    title: "Renovation & Improvement Log",
    description: "Track every dollar you invest. AI calculates how much value each improvement adds.",
    example: {
      label: "Kitchen Remodel",
      value: "$25,000 invested → $19,500 value added",
      detail: "78% recovery rate (NAR NJ data)",
      color: "blue",
    },
  },
  {
    icon: "📈",
    title: "Sell Timing Intelligence",
    description: "Your town's market conditions, updated monthly. Know when the timing is right.",
    example: {
      label: "Wayne Market",
      value: "Seller's market — 73 avg DOM, 1.5 months supply",
      detail: "Homes selling at 98.5% of list price",
      color: "indigo",
    },
  },
  {
    icon: "📬",
    title: "Monthly Digest Email",
    description: "Everything in one email: value update, nearby sales, maintenance reminders, tax notes.",
    example: {
      label: "Your Home This Month",
      value: "3 homes sold near you, value up 2.1%",
      detail: "Next: HVAC tune-up due in 14 days",
      color: "purple",
    },
  },
  {
    icon: "📋",
    title: "Seller-Ready Package",
    description: "When you're ready to sell, your log becomes your listing's secret weapon — pre-filled disclosures, verified history, and buyer trust.",
    example: {
      label: "Seller Package",
      value: "CMA + net proceeds + improvement history",
      detail: "Auto-generated when you're ready",
      color: "amber",
    },
  },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  red: "bg-red-50 border-red-200 text-red-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
};

export default function MyHomeLogLanding() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Free for all NJ homeowners
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy leading-tight">
            Everything About Your Home,{" "}
            <span className="text-gold">In One Place</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Your MyHome Log saves every valuation, tax analysis, renovation, and market insight — automatically. When you're ready to sell, it's all there.
          </p>
        </div>
      </section>

      {/* Preview sections */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy mb-10">
            Here's What Gets Saved to Your Log
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {PREVIEW_SECTIONS.map((s) => (
              <div key={s.title} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{s.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{s.description}</p>
                  </div>
                </div>
                {/* Example preview */}
                <div className={`mt-4 rounded-xl border p-4 ${COLOR_MAP[s.example.color]}`}>
                  <p className="text-[10px] uppercase tracking-wide opacity-60 font-semibold">Example</p>
                  <p className="font-bold mt-1">{s.example.value}</p>
                  <p className="text-xs mt-0.5 opacity-75">{s.example.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-navy mb-8">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "Enter Your Phone", desc: "Your phone number is your key. No passwords, no emails required." },
              { step: "2", title: "Use Any Tool", desc: "Run a valuation, check your taxes, analyze sell timing — it all auto-saves." },
              { step: "3", title: "Watch It Grow", desc: "Monthly digest, value tracking, maintenance reminders — your home's story, building over time." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white font-bold">
                  {s.step}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign up CTA */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4">
          <SaveToLogCTA
            toolType="cma"
            headline="Start your MyHome Log — it's free, forever"
          />
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 bg-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { value: "Free", label: "No credit card ever" },
              { value: "Private", label: "Your data stays yours" },
              { value: "24/7", label: "Vale AI on WhatsApp" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-navy">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
