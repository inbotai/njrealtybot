"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VoiceButton from "./VoiceButton";
import HeroChat from "./HeroChat";

// ── Homeowner-intent chips (config-driven) ───────────────────

const HOMEOWNER_CHIPS: Array<{ label: string; href: string }> = [
  { label: "Am I overpaying taxes?", href: "/tax-shock" },
  { label: "What's my home worth?", href: "/sell" },
  { label: "Is NJ holding my money?", href: "/benefits" },
  { label: "Should I sell in 2026?", href: "/sell-timing" },
  { label: "Renovation ROI", href: "/renovate" },
];

// ── Hero component ───────────────────────────────────────────

export default function HomeHero() {
  const [activeTab, setActiveTab] = useState<"home" | "search">("home");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const router = useRouter();

  function handleSubmit(text?: string) {
    const q = (text || address).trim();
    if (!q || loading) return;
    setLoading(true);
    router.push(`/chat?q=${encodeURIComponent(`CMA for ${q}`)}`);
  }

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {/* Positioning line */}
        <p className="text-xs font-medium tracking-wide text-gray-400 uppercase mb-4">
          New Jersey's AI platform for homeowners — powered by real MLS, tax, and municipal data
        </p>

        {/* H1 */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-tight">
          What's happening with{" "}
          <span className="text-gold">your home?</span>
        </h1>

        {activeTab === "home" && (
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Enter your address — get your home's value, your property-tax verdict, and your best time to sell. Free, in 30 seconds.
          </p>
        )}

        {/* Tab switcher */}
        <div className="mt-8 inline-flex rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              activeTab === "home"
                ? "bg-navy text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Home
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              activeTab === "search"
                ? "bg-navy text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Search Homes
          </button>
        </div>

        {/* Input area */}
        <div className="mt-6">
          {activeTab === "home" ? (
            <>
              <div className="flex overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-gray-200 px-4 py-2 items-center gap-2">
                {!voiceActive && (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                    placeholder="Enter your NJ address (e.g. 36 Clark Ave, Bloomfield)"
                    className="flex-1 px-2 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                )}
                <VoiceButton
                  onTranscript={(text) => { setAddress(text); handleSubmit(text); }}
                  onRecordingChange={setVoiceActive}
                />
                {!voiceActive && (
                  <button
                    onClick={() => handleSubmit()}
                    disabled={!address.trim() || loading}
                    className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-yellow-400 disabled:opacity-40"
                  >
                    {loading ? "..." : "Get My Report"}
                  </button>
                )}
              </div>

              {/* Homeowner chips */}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {HOMEOWNER_CHIPS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => router.push(c.href)}
                    className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gold hover:text-navy hover:bg-gold/5"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <HeroChat />
          )}
        </div>
      </div>
    </section>
  );
}
