"use client";

import { useState } from "react";

const examples = [
  {
    room: "Living Room",
    before: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800",
    after: "https://prod-files.decor8.ai/customer-images/decor8ai_api_user_58081/7e3398d8-81ea-4714-997b-77b48ca9fe04.jpg",
  },
  {
    room: "Bedroom",
    before: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
    after: "https://prod-files.decor8.ai/customer-images/decor8ai_api_user_58081/bd98d35f-599b-4cd3-8c6e-36cbdf0a8938.jpg",
  },
  {
    room: "Kitchen",
    before: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    after: "https://prod-files.decor8.ai/customer-images/decor8ai_api_user_58081/39e60ee5-186d-449d-ad5f-96724967ac10.jpg",
  },
];

function BeforeAfterSlider({ before, after, room }: { before: string; after: string; room: string }) {
  const [position, setPosition] = useState(50);

  return (
    <div className="overflow-hidden rounded-xl shadow-lg">
      <div className="relative aspect-[4/3] select-none" style={{ touchAction: "none" }}>
        {/* After (full) */}
        <img src={after} alt={`${room} — After`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        {/* Before (clipped) */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img src={before} alt={`${room} — Before`} className="h-full w-full object-cover" style={{ minWidth: "100%", width: `${10000 / position}%`, maxWidth: "none" }} draggable={false} />
        </div>
        {/* Divider */}
        <div className="absolute top-0 bottom-0 z-10 w-1 bg-white shadow-lg" style={{ left: `${position}%`, transform: "translateX(-50%)" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
            <svg className="h-5 w-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
            </svg>
          </div>
        </div>
        {/* Labels */}
        <span className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">Before</span>
        <span className="absolute top-3 right-3 rounded-full bg-gold/90 px-3 py-1 text-xs font-bold text-navy">After</span>
        {/* Drag area */}
        <input
          type="range"
          min={5}
          max={95}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
          aria-label={`Before/after slider for ${room}`}
        />
      </div>
      <div className="bg-white px-4 py-3 text-center">
        <p className="text-sm font-semibold text-navy">{room}</p>
        <p className="text-xs text-gray-500">Drag the slider to compare</p>
      </div>
    </div>
  );
}

export default function StagingShowcase() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            Virtual Staging by{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Garden State AI
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            See how your home would look professionally staged — in seconds, not days.
          </p>
          <p className="mt-2 text-gray-400">
            Homes with professional staging sell <span className="font-bold text-gold">73% faster</span> and for <span className="font-bold text-gold">5-10% more</span>.
          </p>
        </div>
      </section>

      {/* Before/After examples */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {examples.map((ex) => (
              <BeforeAfterSlider key={ex.room} before={ex.before} after={ex.after} room={ex.room} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-navy">Pricing</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
              <p className="text-sm font-medium text-gray-500">Per Photo</p>
              <p className="mt-2 text-4xl font-extrabold text-navy">$20</p>
              <p className="mt-1 text-sm text-gray-500">per photo</p>
              <ul className="mt-4 space-y-2 text-left text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> AI-powered virtual staging
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Modern design styles
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Delivered in minutes
                </li>
              </ul>
              <a href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20stage%20my%20photos"
                target="_blank" rel="noopener noreferrer"
                className="mt-6 block rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-900">
                Get Started
              </a>
            </div>
            <div className="rounded-xl border-2 border-gold bg-gradient-to-b from-gold/5 to-white p-6">
              <p className="text-sm font-medium text-gold">List With Us</p>
              <p className="mt-2 text-4xl font-extrabold text-navy">Free</p>
              <p className="mt-1 text-sm text-gray-500">included when you list</p>
              <ul className="mt-4 space-y-2 text-left text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Unlimited photo staging
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Professional listing description
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> Full CMA + market analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> 24/7 AI assistant (Vale)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">&#10003;</span> 90 days or sell it free
                </li>
              </ul>
              <a href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20list%20my%20home"
                target="_blank" rel="noopener noreferrer"
                className="mt-6 block rounded-lg bg-gold px-6 py-3 text-sm font-bold text-navy hover:bg-yellow-400">
                List My Home
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-navy">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">1</div>
              <h3 className="mt-3 font-semibold text-navy">Send Photos</h3>
              <p className="mt-1 text-sm text-gray-600">Send photos of your empty rooms to Vale via WhatsApp or upload them here.</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">2</div>
              <h3 className="mt-3 font-semibold text-navy">AI Stages Them</h3>
              <p className="mt-1 text-sm text-gray-600">Our AI adds professional furniture and decor in your chosen style — in minutes, not days.</p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">3</div>
              <h3 className="mt-3 font-semibold text-navy">Sell Faster</h3>
              <p className="mt-1 text-sm text-gray-600">Use the staged photos in your listing. Staged homes sell 73% faster and for more money.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-12 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold">Ready to See Your Home Transformed?</h2>
          <p className="mt-2 text-gray-300">Send your photos to Vale — results in minutes.</p>
          <a
            href="https://wa.me/12015281095?text=Hi%20Vale!%20I%20want%20to%20stage%20my%20home%20photos"
            target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-3.5 text-base font-bold text-white transition hover:bg-[#20bd5a]"
          >
            <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
              <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
            </svg>
            Stage My Photos on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
