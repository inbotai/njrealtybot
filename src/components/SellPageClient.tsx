"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VoiceButton from "./VoiceButton";

const testimonials = [
  { name: "Maria G.", city: "Bloomfield", text: "Vale gave me an instant estimate and connected me with an agent the same day. Sold above asking!" },
  { name: "James R.", city: "Paramus", text: "The CMA report was incredibly detailed. I knew exactly how to price my home." },
  { name: "Sandra L.", city: "Fort Lee", text: "From valuation to closing in 45 days. The AI assistant made everything smooth." },
];

const stats = [
  { value: "50,000+", label: "Properties Analyzed" },
  { value: "21", label: "NJ Counties Covered" },
  { value: "30 sec", label: "Instant Valuation" },
  { value: "Free", label: "No Obligation" },
];

export default function SellPageClient() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(`CMA for ${address}`)}`);
  }

  function handleVoice(text: string) {
    // If they say an address, go to CMA
    router.push(`/chat?q=${encodeURIComponent(`CMA for ${text}`)}`);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy py-24 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-indigo-900" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            What&apos;s Your Home <span className="text-gold">Worth?</span>
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Get a free AI-powered valuation in 30 seconds. No obligation.
          </p>

          {/* Address input */}
          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl">
            <div className="flex overflow-hidden rounded-xl bg-white shadow-2xl">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your property address... (e.g. 36 Clark Ave, Bloomfield)"
                className="flex-1 px-5 py-4 text-base text-gray-800 outline-none placeholder:text-gray-400"
              />
              <VoiceButton onTranscript={handleVoice} className="px-3" />
              <button
                type="submit"
                disabled={!address.trim()}
                className="bg-gold px-8 text-sm font-bold text-navy transition hover:bg-yellow-400 disabled:opacity-40"
              >
                Get Free Estimate
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Or click the microphone and say your address
            </p>
          </form>
        </div>
      </section>

      {/* Stats */}
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

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-navy">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">1</div>
              <h3 className="mt-4 font-semibold text-navy">Enter Your Address</h3>
              <p className="mt-2 text-sm text-gray-600">Type or speak your address. Vale instantly finds your property in public records and MLS data.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">2</div>
              <h3 className="mt-4 font-semibold text-navy">Get Instant Estimate</h3>
              <p className="mt-2 text-sm text-gray-600">Our AI analyzes recent sales, market trends, and your property details to give you an estimated value range.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">3</div>
              <h3 className="mt-4 font-semibold text-navy">Full CMA Report</h3>
              <p className="mt-2 text-sm text-gray-600">Want the full picture? Get a detailed Comparative Market Analysis with comparable sales sent directly to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-navy">Why Sell With Us?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              { title: "AI-Powered Marketing", desc: "Your listing reaches the right buyers through intelligent targeting and Vale, our 24/7 AI assistant." },
              { title: "Maximum Exposure", desc: "Listed on NJMLS, GSMLS, Zillow, Realtor.com, Redfin, and hundreds more sites." },
              { title: "Data-Driven Pricing", desc: "We analyze 50,000+ properties to find the perfect price point for your home." },
              { title: "Professional Photography", desc: "High-quality photos and virtual tours to showcase your home at its best." },
              { title: "Dedicated Agent", desc: "Personal guidance from listing to closing, plus real-time updates via WhatsApp." },
              { title: "No Upfront Costs", desc: "Free valuation, free CMA, free consultation. You only pay when your home sells." },
            ].map((b) => (
              <div key={b.title} className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-navy">{b.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-navy">What Sellers Say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border bg-white p-5">
                <p className="text-sm text-gray-600 italic">&quot;{t.text}&quot;</p>
                <p className="mt-3 text-sm font-semibold text-navy">{t.name}</p>
                <p className="text-xs text-gray-400">{t.city}, NJ</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold">Ready to Find Out What Your Home Is Worth?</h2>
          <p className="mt-3 text-gray-300">It takes 30 seconds. No strings attached.</p>
          <button
            onClick={() => document.querySelector("input")?.focus()}
            className="mt-6 rounded-xl bg-gold px-8 py-3 font-bold text-navy hover:bg-yellow-400"
          >
            Get My Free Valuation
          </button>
          <p className="mt-4 text-sm text-gray-400">
            Or message us on WhatsApp: <a href="https://wa.me/12015281095" className="text-gold hover:underline">+1 (201) 528-1095</a>
          </p>
        </div>
      </section>
    </>
  );
}
