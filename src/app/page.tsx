"use client";

import { useState } from "react";
import { useAdmin } from "@/components/AdminAuth";
import { useRouter } from "next/navigation";
import HeroChat from "@/components/HeroChat";

const WA_LINK = "https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate";

const WA_ICON = (
  <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
    <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
  </svg>
);

function WhatsAppFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={2} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-navy">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  // ── Logged in: full homepage with hero search + WhatsApp promo ──
  if (isAdmin) {
    return (
      <>
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy py-20 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">Garden</span>
              <span className="text-white"> State </span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite_0.5s]">AI</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              The Most Advanced Real Estate AI in New Jersey
            </p>

            {/* Search bar */}
            <div className="mt-10">
              <HeroChat />
            </div>

            {/* Admin logout — subtle */}
            <button onClick={logout} className="mt-6 text-xs text-gray-500 hover:text-gray-300 transition">
              Logout
            </button>
          </div>
        </section>

        {/* WhatsApp promo section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
              {/* Left: messaging */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 px-4 py-1.5 text-sm font-semibold text-[#128C7E]">
                  {WA_ICON}
                  <span className="text-xs">Available 24/7</span>
                </div>
                <h2 className="mt-4 text-2xl font-extrabold text-navy md:text-3xl">
                  Take Garden State AI to your WhatsApp
                </h2>
                <p className="mt-3 text-gray-600">
                  Search homes, get instant CMAs, schedule showings and receive market alerts — all from one app. Send a voice message or type, Vale responds to everything.
                </p>

                <div className="mt-6 space-y-4">
                  <WhatsAppFeature
                    title="Voice or text — Vale understands both"
                    desc="Send a voice note saying &quot;homes in Hoboken under 500k&quot; and get instant results"
                  />
                  <WhatsAppFeature
                    title="Instant CMA reports"
                    desc="Say your address and get a full valuation with comparable sales delivered to your chat"
                  />
                  <WhatsAppFeature
                    title="Schedule showings on the go"
                    desc="Tell Vale when you're free and the appointment is set — no calls, no emails"
                  />
                  <WhatsAppFeature
                    title="Market alerts in real time"
                    desc="New listings, price drops and sold homes near you — Vale notifies you instantly"
                  />
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-7 py-3.5 text-base font-bold text-white transition hover:bg-[#20bd5a] hover:shadow-lg"
                  >
                    {WA_ICON}
                    Open Vale on WhatsApp
                  </a>
                  <p className="mt-3 text-xs text-gray-400">
                    +1 (201) 528-1095 — save the number to your contacts
                  </p>
                </div>
              </div>

              {/* Right: phone mockup */}
              <div className="w-72 flex-shrink-0">
                <div className="rounded-3xl border-4 border-gray-200 bg-gray-50 p-4 shadow-xl">
                  {/* WhatsApp header */}
                  <div className="flex items-center gap-2 rounded-t-xl bg-[#075E54] px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center">
                      <svg viewBox="0 0 200 200" className="h-5 w-5">
                        <circle cx="100" cy="100" r="100" fill="#0f0a1e" />
                        <circle cx="100" cy="105" r="52" fill="#4f46e5" />
                        <ellipse cx="82" cy="105" rx="6" ry="7" fill="#fcd34d" />
                        <ellipse cx="118" cy="105" rx="6" ry="7" fill="#fcd34d" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Vale - Garden State AI</p>
                      <p className="text-[10px] text-green-200">online</p>
                    </div>
                  </div>
                  {/* Chat bubbles */}
                  <div className="space-y-2 bg-[#ECE5DD] p-3 rounded-b-xl min-h-[280px]">
                    <div className="ml-auto max-w-[80%] rounded-lg bg-[#DCF8C6] px-3 py-1.5 text-xs text-gray-800">
                      What&apos;s my home worth? 37 Summit Ave, Bloomfield
                    </div>
                    <div className="max-w-[85%] rounded-lg bg-white px-3 py-1.5 text-xs text-gray-800">
                      <p className="font-semibold">Estimated Value: $485,000</p>
                      <p className="mt-1 text-gray-500">Range: $460k - $510k</p>
                      <p className="mt-1">Based on 12 recent sales in Bloomfield. Want me to send you the full CMA with comparable addresses?</p>
                    </div>
                    <div className="ml-auto max-w-[80%] rounded-lg bg-[#DCF8C6] px-3 py-1.5 text-xs text-gray-800">
                      Yes please!
                    </div>
                    <div className="max-w-[85%] rounded-lg bg-white px-3 py-1.5 text-xs text-gray-800">
                      Sending your full CMA report now... Check your messages in a moment!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── Not logged in: login page + WhatsApp promo ──
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-navy py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-md px-4 text-center">
        {/* Logo */}
        <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
          <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">Garden</span>
          <span className="text-white"> State </span>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite_0.5s]">AI</span>
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          The Most Advanced Real Estate AI in NJ
        </p>

        {/* Login form */}
        <form onSubmit={handleLogin} className="mx-auto mt-10 max-w-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-medium text-gray-300 mb-4">Admin Login</p>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter password"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={!password.trim()}
              className="mt-4 w-full rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-yellow-400 disabled:opacity-40"
            >
              Login
            </button>
          </div>
        </form>

        {/* Lead capture — Mobile: WhatsApp is THE action */}
        <div className="mt-12 md:hidden">
          <p className="text-sm text-gray-400 mb-4">
            Looking to buy or sell in NJ? Vale is one tap away.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white transition hover:bg-[#20bd5a]"
          >
            {WA_ICON}
            Open Vale on WhatsApp
          </a>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Search homes, get instant CMAs & schedule showings — all from your phone
          </p>
        </div>

        {/* Lead capture — Desktop: both options */}
        <div className="mt-12 hidden md:block">
          <p className="text-sm text-gray-400 mb-4">
            Looking to buy or sell in NJ? Talk to Vale, our AI partner.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20bd5a] hover:shadow-lg"
            >
              {WA_ICON}
              Chat with Vale on WhatsApp
            </a>
            <a
              href="/chat"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Chat with Vale
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
