"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VoiceButton from "./VoiceButton";
import MarketPoll from "./MarketPoll";

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
  const [voiceActive, setVoiceActive] = useState(false);
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
      {/* Marketing Banner */}
      <section className="bg-navy border-b border-gold/20 py-12 md:py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
            Thinking of Selling your Home?
          </h2>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            List with the most advanced Real Estate AI in New Jersey.
          </p>
          <p className="mt-3 text-lg md:text-2xl font-bold text-white">
            We will sell it in <span className="text-gold font-extrabold">90 days</span> or We will sell it{" "}
            <span className="text-gold font-extrabold">for Free</span>.
          </p>
          <p className="mt-2 text-lg text-gray-300">Contact us now.</p>
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-center md:gap-4">
            <a
              href="/chat?q=CMA"
              className="inline-block rounded-xl bg-gold px-8 py-3.5 text-base font-bold text-navy transition hover:bg-yellow-400 hover:shadow-lg"
            >
              Get My Free CMA
            </a>
            <a
              href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20list%20my%20home"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-3.5 text-base font-bold text-white transition hover:bg-[#20bd5a] hover:shadow-lg"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
                <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
              </svg>
              List My Home Now
            </a>
          </div>
        </div>
      </section>

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
            <div className="flex overflow-hidden rounded-xl bg-white shadow-2xl px-4 py-2 items-center gap-2">
              {!voiceActive && (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your property address... (e.g. 36 Clark Ave, Bloomfield)"
                  className="flex-1 px-2 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400"
                />
              )}
              <VoiceButton onTranscript={handleVoice} onRecordingChange={setVoiceActive} />
              {!voiceActive && (
                <button
                  type="submit"
                  disabled={!address.trim()}
                  className="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-navy transition hover:bg-yellow-400 disabled:opacity-40"
                >
                  Get Free Estimate
                </button>
              )}
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
              <h3 className="mt-4 font-semibold text-navy">Full CMA Report via WhatsApp</h3>
              <p className="mt-2 text-sm text-gray-600">Get a detailed CMA with comparable sales sent directly to your WhatsApp. Plus ongoing market alerts for your neighborhood.</p>
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

      {/* Seller Poll */}
      <section className="py-16">
        <div className="mx-auto max-w-sm px-4">
          <MarketPoll segment="sellers" />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold">Ready to Find Out What Your Home Is Worth?</h2>
          <p className="mt-3 text-gray-300">It takes 30 seconds. No strings attached.</p>
          {/* Mobile: WhatsApp only */}
          <div className="mt-6 md:hidden">
            <a
              href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20know%20what%20my%20home%20is%20worth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-3.5 text-base font-bold text-white transition hover:bg-[#20bd5a]"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
                <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
              </svg>
              Get My Free Valuation on WhatsApp
            </a>
            <p className="mt-2 text-xs text-gray-400 text-center">
              Vale sends your full CMA with comparable sales directly to your phone
            </p>
          </div>

          {/* Desktop: both options */}
          <div className="mt-6 hidden md:flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20know%20what%20my%20home%20is%20worth"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-3 font-bold text-white transition hover:bg-[#20bd5a] hover:shadow-lg"
              >
                <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
                  <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
                </svg>
                Get Valuation on WhatsApp
              </a>
              <button
                onClick={() => document.querySelector("input")?.focus()}
                className="rounded-xl bg-gold px-8 py-3 font-bold text-navy hover:bg-yellow-400"
              >
                Or Type Your Address
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              WhatsApp is the fastest way — Vale sends your full CMA report with comparable sales directly to your phone
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
