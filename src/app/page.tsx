"use client";

import { useState } from "react";
import { useAdmin } from "@/components/AdminAuth";
import { useRouter } from "next/navigation";
import HeroChat from "@/components/HeroChat";
import HeroSeller from "@/components/HeroSeller";
import { submitLead } from "@/lib/api";
import { MockProvider } from "@/lib/service-ladder/property-tax/data-provider";
import { analyzePropertyTax, formatCurrency, formatPercent } from "@/lib/service-ladder/property-tax/calc";
import type { Chapter123Analysis } from "@/lib/service-ladder/property-tax/types";

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

  // ── Logged in: full homepage with search + services ──
  if (isAdmin) {
    return (
      <>
        {/* Hero — full search */}
        <section className="relative overflow-hidden bg-navy py-20 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">Garden</span>
              <span className="text-white"> State </span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite_0.5s]">AI</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Search homes, get instant valuations, or sell with AI on your side.
            </p>

            <div className="mt-10">
              <HeroChat />
            </div>

            <button onClick={logout} className="mt-6 text-xs text-gray-500 hover:text-gray-300 transition">
              Logout
            </button>
          </div>
        </section>

        {/* WhatsApp CTA banner */}
        <div className="bg-navy px-4 pb-6">
          <div className="mx-auto max-w-4xl rounded-xl border border-[#25D366]/30 bg-gradient-to-r from-[#25D366]/15 via-[#25D366]/5 to-[#25D366]/15 px-6 py-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-white">Chat with Vale on WhatsApp for the best experience</p>
                <p className="mt-1 text-xs text-gray-400">Instant valuations, property photos, market alerts &amp; more — right on your phone</p>
              </div>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20bd5a] hover:shadow-lg">
                {WA_ICON} Message Vale
              </a>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <section className="border-b bg-white py-10">
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-12 px-4">
            {[
              { value: "60,000+", label: "MLS Listings" },
              { value: "21", label: "NJ Counties" },
              { value: "2", label: "MLS Feeds (NJMLS + GSMLS)" },
              { value: "15 min", label: "Sync Frequency" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-navy">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-bold text-navy">Platform Features</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <a href="/search" className="group rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-lg hover:border-gold">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl">&#128269;</div>
                <h3 className="mt-3 font-semibold text-navy group-hover:text-gold">Property Search</h3>
                <p className="mt-1 text-xs text-gray-500">60k+ listings from NJMLS &amp; GSMLS with AI-powered natural language search</p>
              </a>
              <a href="/sell" className="group rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-lg hover:border-gold">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-xl">&#127968;</div>
                <h3 className="mt-3 font-semibold text-navy group-hover:text-gold">Home Valuation</h3>
                <p className="mt-1 text-xs text-gray-500">AI valuation in 30 seconds — public records + comps + Zillow/Redfin data</p>
              </a>
              <a href="/staging" className="group rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-lg hover:border-gold">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-xl">&#10024;</div>
                <h3 className="mt-3 font-semibold text-navy group-hover:text-gold">Virtual Staging</h3>
                <p className="mt-1 text-xs text-gray-500">AI staging for empty rooms — $20/photo or free when sellers list with you</p>
              </a>
              <a href="/market" className="group rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-lg hover:border-gold">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">&#128200;</div>
                <h3 className="mt-3 font-semibold text-navy group-hover:text-gold">Market Intelligence</h3>
                <p className="mt-1 text-xs text-gray-500">City reports, investment scores, deal finder, demand tracking — all AI-powered</p>
              </a>
            </div>
          </div>
        </section>

        {/* AI capabilities */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-2xl font-bold text-navy">What Vale Can Do</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                { title: "24/7 AI Assistant", desc: "Vale handles inquiries on web and WhatsApp — searches, valuations, showings, follow-ups. Never misses a lead." },
                { title: "Persistent Memory", desc: "Vale remembers every client — name, preferences, search history. Returning visitors get a personalized greeting." },
                { title: "Automated Lead Gen", desc: "6 sources: expired listings, stale homes, price drops, overpriced, neighbor alerts, website visitors." },
                { title: "Smart Follow-Up", desc: "Auto WhatsApp reminders to leads that go quiet. Just Sold digests to keep buyers engaged." },
                { title: "Voice + Text", desc: "Clients can send voice notes in English or Spanish. Vale transcribes and understands both." },
                { title: "Demand Signals", desc: "See how many buyers are viewing each listing. Bidding war probability. Match scores per buyer." },
              ].map((f) => (
                <div key={f.title} className="rounded-xl bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-navy">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tax Appeal hero bar */}
        <TaxAppealBar />
      </>
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
  const [idxPassword, setIdxPassword] = useState("");
  const [idxError, setIdxError] = useState("");
  const [showIdxLogin, setShowIdxLogin] = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistPhone.trim() || waitlistLoading) return;
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
      {/* Hero — seller valuation */}
      <section className="relative overflow-hidden bg-navy py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Find Out What Your Home Is{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Worth
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Free AI-powered valuation in 30 seconds. No obligation.
          </p>

          <div className="mt-10">
            <HeroSeller />
          </div>
        </div>
      </section>

      {/* WhatsApp CTA banner */}
      <div className="bg-navy px-4 pb-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-[#25D366]/30 bg-gradient-to-r from-[#25D366]/15 via-[#25D366]/5 to-[#25D366]/15 px-6 py-5">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-white">
                Chat with Vale on WhatsApp for the best experience
              </p>
              <p className="mt-1 text-xs text-gray-400">
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
              <button
                type="submit"
                disabled={!waitlistPhone.trim() || waitlistLoading}
                className="w-full rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-indigo-900 disabled:opacity-40"
              >
                {waitlistLoading ? "..." : "Join the Waitlist"}
              </button>
              <p className="text-xs text-gray-400">
                We&apos;ll only use this to notify you when property search launches.
              </p>
            </form>
          )}
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

/* ────────────────────────────────────────────────────────
   Tax Appeal hero bar — inline on admin homepage
   ──────────────────────────────────────────────────────── */

const taxProvider = new MockProvider();

function TaxAppealBar() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Chapter123Analysis | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const [assessment, comps] = await Promise.all([
      taxProvider.getAssessment(address),
      taxProvider.getComparableSales(address),
    ]);
    if (!assessment) {
      setError("Property not found. Try a full address like \"123 Maple St, Montclair, NJ\".");
      setLoading(false);
      return;
    }
    if (comps.length < 2) {
      setError("Not enough comparable sales to analyze.");
      setLoading(false);
      return;
    }
    const ratio = await taxProvider.getDirectorRatio(assessment.county);
    if (!ratio) {
      setError(`Director's Ratio not available for ${assessment.county} County.`);
      setLoading(false);
      return;
    }
    setAnalysis(analyzePropertyTax(assessment, comps, ratio));
    setLoading(false);
  }

  return (
    <section className="bg-gradient-to-br from-navy via-indigo-900 to-navy py-14">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-2xl font-extrabold text-white md:text-3xl">
          Are You Paying Too Much in{" "}
          <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
            Property Taxes
          </span>
          ?
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Free NJ Chapter 123 analysis — enter your address and find out instantly.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-3 mx-auto max-w-xl">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Maple St, Montclair, NJ"
            required
            className="flex-1 rounded-lg border-0 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            disabled={loading}
            className="whitespace-nowrap rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Check My Taxes"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {/* Inline results */}
        {analysis && (
          <div className="mt-8 mx-auto max-w-3xl rounded-xl bg-white p-6 text-left shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-gray-900">Your Analysis</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                analysis.appealLikelihood === "high" ? "bg-green-100 text-green-800"
                  : analysis.appealLikelihood === "moderate" ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-600"
              }`}>
                {analysis.appealLikelihood === "high" ? "Strong Case"
                  : analysis.appealLikelihood === "moderate" ? "Possible Case" : "Unlikely Benefit"}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase text-gray-500">Est. Overpayment</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {analysis.overpaymentLow === 0 && analysis.overpaymentHigh === 0
                    ? "$0"
                    : `${formatCurrency(analysis.overpaymentLow)} – ${formatCurrency(analysis.overpaymentHigh)}`}
                </p>
                <p className="text-xs text-gray-500">per year</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase text-gray-500">Appeal Likelihood</p>
                <p className="mt-1 text-xl font-bold capitalize text-gray-900">{analysis.appealLikelihood}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase text-gray-500">Filing Deadline</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{analysis.filingDeadline}</p>
              </div>
            </div>

            {/* Comps */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="pb-2 pr-4">Comparable</th>
                    <th className="pb-2 pr-4">Sale Price</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.comparables.map((c, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{c.address}</td>
                      <td className="py-2 pr-4">{formatCurrency(c.salePrice)}</td>
                      <td className="py-2 pr-4">{c.saleDate}</td>
                      <td className="py-2">{c.distanceMiles} mi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chapter 123 details */}
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                <dt className="text-gray-600">Director&apos;s Ratio</dt>
                <dd className="font-medium">{formatPercent(analysis.directorRatio)}</dd>
              </div>
              <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                <dt className="text-gray-600">Common Level Range</dt>
                <dd className="font-medium">{formatPercent(analysis.commonLevelRangeLow)} – {formatPercent(analysis.commonLevelRangeHigh)}</dd>
              </div>
              <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                <dt className="text-gray-600">Implied Market Value</dt>
                <dd className="font-medium">{formatCurrency(analysis.impliedMarketValue)}</dd>
              </div>
              <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                <dt className="text-gray-600">Comp-Based Value</dt>
                <dd className="font-medium">{formatCurrency(analysis.estimatedMarketValueLow)} – {formatCurrency(analysis.estimatedMarketValueHigh)}</dd>
              </div>
            </dl>

            {analysis.isOverAssessed && (
              <a href="/property-tax" className="mt-4 block w-full rounded-lg bg-gold px-6 py-3 text-center font-bold text-navy hover:bg-yellow-400">
                Generate My Appeal Packet
              </a>
            )}

            <p className="mt-3 text-xs text-gray-400">
              Estimate only — not a guarantee or legal/tax advice. Consult a licensed professional for individualized guidance.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
