"use client";

import { useState } from "react";
import { useAdmin } from "@/components/AdminAuth";
import { useRouter } from "next/navigation";
import HeroChat from "@/components/HeroChat";
import HeroSeller from "@/components/HeroSeller";
import { submitLead } from "@/lib/api";
import NewsletterSignup from "@/components/NewsletterSignup";
import SmsConsent from "@/components/SmsConsent";

const WA_LINK = "https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate";

const WA_ICON = (
  <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
    <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
  </svg>
);

export default function HomePage() {
  const { isAdmin, login, logout, changePassword } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showChangePw, setShowChangePw] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!login(password)) {
      setError("Invalid password");
      setTimeout(() => setError(""), 3000);
    } else {
      router.refresh();
    }
  }

  function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    // Verify current password first
    if (!login(password)) { setPwMsg("Current password is incorrect"); return; }
    if (newPw.length < 4) { setPwMsg("Minimum 4 characters"); return; }
    if (newPw !== confirmPw) { setPwMsg("Passwords don't match"); return; }
    if (changePassword(newPw)) {
      setPwMsg("Password updated!");
      setNewPw(""); setConfirmPw(""); setPassword("");
      setTimeout(() => { setShowChangePw(false); setPwMsg(""); }, 1500);
    }
  }

  // ── Logged in: full homepage with search + CTAs ──
  if (isAdmin) {
    return (
      <section className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-2xl text-center mt-4">
          <h1 className="mb-6 text-3xl sm:text-4xl font-bold text-navy">What can I help you search?</h1>
          <HeroChat />

          {/* CTAs — prominent seller tools */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a href="/sell" className="group rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-center text-white transition hover:shadow-xl hover:scale-[1.02]">
              <p className="text-3xl">🏠</p>
              <h2 className="mt-3 text-base font-bold">What&apos;s My Home Worth?</h2>
              <p className="mt-1 text-xs text-indigo-200">Free AI valuation in 30 seconds</p>
              <span className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-1.5 text-xs font-bold group-hover:bg-white/30 transition">Get Valuation →</span>
            </a>
            <a href="/renovate" className="group rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-center text-white transition hover:shadow-xl hover:scale-[1.02]">
              <p className="text-3xl">✨</p>
              <h2 className="mt-3 text-base font-bold">Thinking of Renovating?</h2>
              <p className="mt-1 text-xs text-amber-100">See the ROI + AI before &amp; after</p>
              <span className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-1.5 text-xs font-bold group-hover:bg-white/30 transition">See Renovation ROI →</span>
            </a>
            <a href="/tax-shock" className="group rounded-xl bg-gradient-to-br from-red-600 to-red-700 p-6 text-center text-white transition hover:shadow-xl hover:scale-[1.02]">
              <p className="text-3xl">💰</p>
              <h2 className="mt-3 text-base font-bold">Am I Overpaying Taxes?</h2>
              <p className="mt-1 text-xs text-red-200">Compare to real sales data</p>
              <span className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-1.5 text-xs font-bold group-hover:bg-white/30 transition">Check Taxes →</span>
            </a>
            <a href="/list" className="group rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-center text-white transition hover:shadow-xl hover:scale-[1.02]">
              <p className="text-3xl">📝</p>
              <h2 className="mt-3 text-base font-bold">List My Home</h2>
              <p className="mt-1 text-xs text-emerald-200">Digital onboarding in 5 min</p>
              <span className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-1.5 text-xs font-bold group-hover:bg-white/30 transition">Start Listing →</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── Not logged in: seller-focused public homepage ──
  return <PublicHomepage />;
}

/* ────────────────────────────────────────────────────────
   Public homepage — seller lead machine (no IDX listings)
   ──────────────────────────────────────────────────────── */

const stats = [
  { value: "50,000+", label: "Properties Analyzed" },
  { value: "21", label: "NJ Counties" },
  { value: "30 sec", label: "Instant Valuation" },
  { value: "Free", label: "No Obligation" },
];

function PublicHomepage() {
  const { login } = useAdmin();
  const [waitlistPhone, setWaitlistPhone] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistSent, setWaitlistSent] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistConsent, setWaitlistConsent] = useState(false);
  const [idxPassword, setIdxPassword] = useState("");
  const [idxError, setIdxError] = useState("");
  const [showIdxLogin, setShowIdxLogin] = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistPhone.trim() || waitlistLoading || !waitlistConsent) return;
    setWaitlistLoading(true);
    try {
      await submitLead({
        full_name: waitlistName.trim() || "Buyer Waitlist",
        phone: waitlistPhone.trim(),
        message: "Buyer waitlist signup from homepage",
        lead_type: "buyer_waitlist",
      });
      setWaitlistSent(true);
    } catch { /* fail silently */ }
    setWaitlistLoading(false);
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "name": "Garden State AI",
            "url": "https://gardenstate.ai",
            "logo": "https://gardenstate.ai/icon.svg",
            "description": "AI-powered real estate platform for New Jersey homeowners, buyers, and sellers.",
            "areaServed": { "@type": "State", "name": "New Jersey" }
          },
          {
            "@type": "SoftwareApplication",
            "name": "Garden State AI",
            "applicationCategory": "RealEstateApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "featureList": [
              "Home Valuation NJ", "Property Tax Appeal Generator", "Tax Shock Analysis",
              "NJ MLS Search (60K+ listings)", "Vale AI Assistant", "Net Proceeds Calculator",
              "Renovation ROI Calculator", "Affordability Calculator", "Market Intelligence",
              "Investment Deal Finder", "Open Houses NJ", "Price & Comp Alerts"
            ]
          }
        ]
      }) }} />
      {/* Hero — seller valuation */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy">
            Find Out What Your Home Is{" "}
            <span className="text-gold">
              Worth
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Free AI-powered valuation in 30 seconds. No obligation.
          </p>

          <div className="mt-10">
            <HeroSeller />
          </div>
        </div>
      </section>

      {/* WhatsApp CTA banner */}
      <div className="bg-white px-4 pb-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-[#25D366]/30 bg-gradient-to-r from-[#25D366]/15 via-[#25D366]/5 to-[#25D366]/15 px-6 py-5">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-navy">
                Chat with Vale on WhatsApp for the best experience
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Instant valuations, property photos, market alerts &amp; more — right on your phone
              </p>
            </div>
            <a
              href="https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20bd5a] hover:shadow-lg"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4">
                <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
              </svg>
              Message Vale
            </a>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <section className="border-b bg-white py-10">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-12 px-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-navy">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">Our Services</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <a href="/sell" className="group rounded-xl border bg-white p-6 text-center shadow-sm transition hover:shadow-lg hover:border-gold">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                <span>&#127968;</span>
              </div>
              <h3 className="mt-4 font-semibold text-navy group-hover:text-gold">Free Home Valuation</h3>
              <p className="mt-2 text-sm text-gray-600">Get an AI-powered estimate in 30 seconds. No obligation.</p>
            </a>
            <a href="/staging" className="group rounded-xl border bg-white p-6 text-center shadow-sm transition hover:shadow-lg hover:border-gold">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-2xl">
                <span>&#10024;</span>
              </div>
              <h3 className="mt-4 font-semibold text-navy group-hover:text-gold">Home Staging Services</h3>
              <p className="mt-2 text-sm text-gray-600">AI virtual staging — see your home transformed. $20/photo, free when you list with us.</p>
            </a>
            <a href="/market" className="group rounded-xl border bg-white p-6 text-center shadow-sm transition hover:shadow-lg hover:border-gold">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                <span>&#128200;</span>
              </div>
              <h3 className="mt-4 font-semibold text-navy group-hover:text-gold">Market Reports</h3>
              <p className="mt-2 text-sm text-gray-600">City-level trends, investment scores, and pricing data for every NJ market.</p>
            </a>
          </div>
        </div>
      </section>


      {/* Buyer waitlist */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <h2 className="text-2xl font-bold text-navy">Looking to Buy?</h2>
          <p className="mt-3 text-gray-600">
            Our full property search is launching soon. Be the first to access new listings before they hit the market.
          </p>
          {waitlistSent ? (
            <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4">
              <p className="font-semibold text-green-800">You&apos;re on the list!</p>
              <p className="mt-1 text-sm text-green-600">We&apos;ll notify you as soon as the property search goes live.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="mt-6 space-y-3">
              <input
                type="text"
                value={waitlistName}
                onChange={(e) => setWaitlistName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <input
                type="tel"
                value={waitlistPhone}
                onChange={(e) => setWaitlistPhone(e.target.value)}
                placeholder="Your phone or WhatsApp number"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <SmsConsent checked={waitlistConsent} onChange={setWaitlistConsent} />
              <button
                type="submit"
                disabled={!waitlistPhone.trim() || waitlistLoading || !waitlistConsent}
                className="w-full rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-indigo-900 disabled:opacity-40"
              >
                {waitlistLoading ? "..." : "Join the Waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* MyHome Log CTA */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* Left — visual */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-200/40 via-purple-200/30 to-gold/20 blur-xl" />
              <div className="relative rounded-2xl bg-white border border-gray-200 shadow-xl p-6 space-y-3">
                {/* Fake timeline entries */}
                <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <span className="text-xl">🏠</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Roof Replacement</p>
                    <p className="text-xs text-gray-500">Bergen Roofing &middot; 30-yr warranty</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-navy">$18,000</p>
                    <p className="text-xs text-green-600 font-medium">+$15,000 value</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
                  <span className="text-xl">🍳</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Kitchen Countertops</p>
                    <p className="text-xs text-gray-500">NJ Stone Works &middot; Quartz</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-navy">$4,800</p>
                    <p className="text-xs text-green-600 font-medium">+$3,744 value</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
                  <span className="text-xl">🔧</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">HVAC Service</p>
                    <p className="text-xs text-gray-500">Comfort Air NJ &middot; Annual tune-up</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-navy">$185</p>
                    <p className="text-xs text-gray-400">Maintenance</p>
                  </div>
                </div>
                {/* Summary bar */}
                <div className="mt-2 flex items-center justify-between rounded-lg bg-navy p-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Total Invested</p>
                    <p className="text-lg font-bold text-white">$22,985</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase">Value Added</p>
                    <p className="text-lg font-bold text-green-400">+$18,744</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — copy + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                NEW — Free for all homeowners
              </div>
              <h2 className="text-3xl font-bold text-navy leading-tight">
                Every Dollar You Put Into Your Home
                <span className="text-gold"> Should Pay You Back</span>
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Track every repair, upgrade, and improvement — with AI that calculates exactly how much value each one adds to your home. When it&apos;s time to sell, your MyHome Log becomes your secret weapon: better valuations, pre-filled disclosures, and a verified history that builds buyer trust.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "AI estimates value impact of every improvement",
                  "Never lose a receipt, warranty, or contractor name",
                  "Pre-fills your seller disclosure when you list",
                  "Share a verified Property History with buyers",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/my-home/log"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg">
                  Start My Home Log — Free
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </a>
              </div>
              <p className="mt-3 text-xs text-gray-400">No credit card. No commitment. Your data stays yours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — placeholder */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy">What Homeowners Say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { name: "Coming Soon", city: "NJ", text: "Testimonial from a real homeowner who used our valuation service." },
              { name: "Coming Soon", city: "NJ", text: "Testimonial from a real homeowner who sold with Garden State AI." },
              { name: "Coming Soon", city: "NJ", text: "Testimonial from a real homeowner about the CMA experience." },
            ].map((t, i) => (
              <div key={i} className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                <p className="text-sm text-gray-400 italic">&quot;{t.text}&quot;</p>
                <p className="mt-3 text-sm font-semibold text-gray-400">{t.name}</p>
                <p className="text-xs text-gray-300">{t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="bg-white py-4">
        <div className="mx-auto max-w-2xl px-4">
          <NewsletterSignup />
        </div>
      </section>

      {/* Agent IDX login — subtle, expandable */}
      <div className="py-6 text-center">
        {!showIdxLogin ? (
          <button onClick={() => setShowIdxLogin(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition">
            Agent Access
          </button>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (login(idxPassword)) {
              window.location.reload();
            } else {
              setIdxError("Invalid password");
              setTimeout(() => setIdxError(""), 3000);
            }
          }} className="mx-auto max-w-xs space-y-2">
            <div className="flex gap-2">
              <input
                type="password"
                value={idxPassword}
                onChange={(e) => { setIdxPassword(e.target.value); setIdxError(""); }}
                placeholder="Password"
                autoFocus
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <button type="submit" disabled={!idxPassword.trim()}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-40">
                Enter
              </button>
            </div>
            {idxError && <p className="text-xs text-red-500">{idxError}</p>}
          </form>
        )}
      </div>
    </>
  );
}

