"use client";

import { useState, useEffect } from "react";
import { fetchRecommendations, fetchListings } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import LeadGate from "@/components/LeadGate";
import type { Listing } from "@/lib/api";

interface BuyerProfile {
  budget: string;
  beds: string;
  cities: string;
  mustHaves: string[];
  lifestyle: string;
  timeline: string;
}

const budgetOptions = [
  { label: "Under $300k", value: "300000" },
  { label: "$300k – $500k", value: "500000" },
  { label: "$500k – $750k", value: "750000" },
  { label: "$750k – $1M", value: "1000000" },
  { label: "$1M+", value: "2000000" },
];

const bedsOptions = ["1", "2", "3", "4", "5+"];

const featureOptions = [
  { id: "garage", label: "Garage", icon: "🚗" },
  { id: "pool", label: "Pool", icon: "🏊" },
  { id: "basement", label: "Basement", icon: "🏠" },
  { id: "yard", label: "Big Yard", icon: "🌳" },
  { id: "new_construction", label: "New/Renovated", icon: "✨" },
  { id: "quiet", label: "Quiet Street", icon: "🤫" },
  { id: "schools", label: "Good Schools", icon: "🎓" },
  { id: "transit", label: "Near Transit", icon: "🚂" },
  { id: "walkable", label: "Walkable", icon: "🚶" },
  { id: "investment", label: "Investment", icon: "📈" },
];

const lifestyleOptions = [
  { id: "family", label: "Family with Kids", icon: "👨‍👩‍👧‍👦" },
  { id: "couple", label: "Couple / Starter Home", icon: "💑" },
  { id: "single", label: "Single Professional", icon: "💼" },
  { id: "investor", label: "Investor", icon: "📊" },
  { id: "retiree", label: "Downsizing / Retiree", icon: "🌅" },
  { id: "remote", label: "Remote Worker", icon: "💻" },
];

const timelineOptions = [
  { label: "ASAP — actively looking", value: "asap" },
  { label: "1–3 months", value: "1-3mo" },
  { label: "3–6 months", value: "3-6mo" },
  { label: "Just exploring", value: "exploring" },
];

export default function BuyerMatchmaker() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BuyerProfile>({
    budget: "", beds: "", cities: "", mustHaves: [], lifestyle: "", timeline: "",
  });
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);

  function toggleFeature(id: string) {
    setProfile(p => ({
      ...p,
      mustHaves: p.mustHaves.includes(id)
        ? p.mustHaves.filter(f => f !== id)
        : [...p.mustHaves, id],
    }));
  }

  async function findMatches() {
    setLoading(true);
    try {
      // Build search params from profile
      const params: Record<string, string> = { status: "Active", limit: "24", sort: "newest" };
      if (profile.budget) params.maxPrice = profile.budget;
      if (profile.beds && profile.beds !== "5+") params.beds = profile.beds;
      if (profile.beds === "5+") params.beds = "5";
      if (profile.cities) {
        const firstCity = profile.cities.split(",")[0].trim();
        if (firstCity) params.city = firstCity;
      }
      const data = await fetchListings(params);
      setResults(data?.listings || []);
      setMatchComplete(true);
    } catch { /* fail gracefully */ }
    setLoading(false);
  }

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  if (matchComplete) {
    return (
      <>
        <section className="bg-navy py-12 text-white">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h1 className="text-3xl font-extrabold">
              Your Matches{" "}
              <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
                ({results.length} found)
              </span>
            </h1>
            <p className="mt-2 text-gray-300">
              Based on: {profile.budget ? `up to $${Number(profile.budget).toLocaleString()}` : "any budget"}
              {profile.beds ? ` · ${profile.beds}+ beds` : ""}
              {profile.cities ? ` · ${profile.cities}` : ""}
              {profile.mustHaves.length > 0 ? ` · ${profile.mustHaves.join(", ")}` : ""}
            </p>
            <button onClick={() => { setMatchComplete(false); setStep(0); }}
              className="mt-4 text-sm text-gold hover:underline">
              Refine search
            </button>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8">
          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-gray-500">No exact matches found</p>
              <p className="mt-2 text-sm text-gray-400">Try broadening your budget or adding more cities</p>
              <button onClick={() => { setMatchComplete(false); setStep(0); }}
                className="mt-4 rounded-lg bg-navy px-6 py-2 text-sm text-white hover:bg-indigo-900">
                Try Again
              </button>
            </div>
          )}
        </div>

        <section className="py-10">
          <div className="mx-auto max-w-lg px-4">
            <LeadGate
              inline={true}
              valueProp="Save My Matches + Get Alerts"
              source="buyer_match"
              message={`Budget: ${profile.budget ? `$${Number(profile.budget).toLocaleString()}` : "any"} | ${profile.beds ? `${profile.beds}+ beds` : "any beds"} | ${profile.cities || "any city"} | ${profile.mustHaves.join(", ") || "no must-haves"} | ${results.length} matches found`}
            />
          </div>
        </section>

        <section className="bg-gray-50 py-12 text-center">
          <div className="mx-auto max-w-lg px-4">
            <h2 className="text-xl font-bold text-navy">Want Better Matches?</h2>
            <p className="mt-2 text-sm text-gray-600">
              The more you browse, the smarter Vale gets. Every property you view refines your profile.
              Come back tomorrow for even better recommendations.
            </p>
            <a href="/chat?q=Help me find my dream home" className="mt-4 inline-block rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-navy hover:bg-yellow-400">
              Chat with Vale for Help
            </a>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            Property{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Matchmaker
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Answer 5 quick questions. Our AI finds properties that match your lifestyle.
          </p>
          {/* Progress bar */}
          <div className="mx-auto mt-6 h-2 max-w-md overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-400">Step {step + 1} of {totalSteps}</p>
        </div>
      </section>

      {/* Quiz */}
      <section className="py-12">
        <div className="mx-auto max-w-2xl px-4">

          {/* Step 0: Budget */}
          {step === 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy">What&apos;s your budget?</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {budgetOptions.map(b => (
                  <button key={b.value} onClick={() => { setProfile(p => ({ ...p, budget: b.value })); setStep(1); }}
                    className={`rounded-xl border-2 px-4 py-4 text-sm font-medium transition ${
                      profile.budget === b.value ? "border-gold bg-gold/5" : "border-gray-200 hover:border-gold/50"
                    }`}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Bedrooms */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy">How many bedrooms?</h2>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {bedsOptions.map(b => (
                  <button key={b} onClick={() => { setProfile(p => ({ ...p, beds: b })); setStep(2); }}
                    className={`h-16 w-16 rounded-xl border-2 text-lg font-bold transition ${
                      profile.beds === b ? "border-gold bg-gold/5 text-navy" : "border-gray-200 text-gray-600 hover:border-gold/50"
                    }`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Cities */}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy">Which NJ cities interest you?</h2>
              <p className="mt-1 text-sm text-gray-500">Enter one or more, separated by commas</p>
              <input
                type="text"
                value={profile.cities}
                onChange={e => setProfile(p => ({ ...p, cities: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter" && profile.cities.trim()) setStep(3); }}
                placeholder="e.g. Hoboken, Jersey City, Paramus"
                className="mx-auto mt-6 w-full max-w-md rounded-xl border-2 border-gray-200 px-4 py-4 text-center text-sm focus:border-gold focus:outline-none"
                autoFocus
              />
              <button onClick={() => setStep(3)} disabled={!profile.cities.trim()}
                className="mt-4 rounded-lg bg-navy px-8 py-3 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-40">
                Next
              </button>
            </div>
          )}

          {/* Step 3: Must-Haves */}
          {step === 3 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy">What matters most to you?</h2>
              <p className="mt-1 text-sm text-gray-500">Select all that apply</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {featureOptions.map(f => (
                  <button key={f.id} onClick={() => toggleFeature(f.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition ${
                      profile.mustHaves.includes(f.id) ? "border-gold bg-gold/5" : "border-gray-200 hover:border-gold/50"
                    }`}>
                    <span className="text-xl">{f.icon}</span>
                    <span className="font-medium text-gray-800">{f.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(4)}
                className="mt-6 rounded-lg bg-navy px-8 py-3 text-sm font-medium text-white hover:bg-indigo-900">
                Next
              </button>
            </div>
          )}

          {/* Step 4: Lifestyle + Timeline + Submit */}
          {step === 4 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy">Tell us about you</h2>
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-600 mb-3">I am a...</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {lifestyleOptions.map(l => (
                    <button key={l.id} onClick={() => setProfile(p => ({ ...p, lifestyle: l.id }))}
                      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left text-sm transition ${
                        profile.lifestyle === l.id ? "border-gold bg-gold/5" : "border-gray-200 hover:border-gold/50"
                      }`}>
                      <span className="text-lg">{l.icon}</span>
                      <span className="font-medium text-gray-800">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-600 mb-3">My timeline is...</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {timelineOptions.map(t => (
                    <button key={t.value} onClick={() => setProfile(p => ({ ...p, timeline: t.value }))}
                      className={`rounded-xl border-2 px-4 py-3 text-sm transition ${
                        profile.timeline === t.value ? "border-gold bg-gold/5" : "border-gray-200 hover:border-gold/50"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={findMatches} disabled={loading}
                className="mt-8 rounded-xl bg-gold px-10 py-4 text-base font-bold text-navy hover:bg-yellow-400 disabled:opacity-50">
                {loading ? "Finding matches..." : "Find My Matches"}
              </button>
            </div>
          )}

          {/* Navigation */}
          {step > 0 && (
            <div className="mt-6 text-center">
              <button onClick={() => setStep(s => s - 1)} className="text-sm text-gray-400 hover:text-navy">
                &larr; Back
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
