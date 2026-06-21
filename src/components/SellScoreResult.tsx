"use client";

import { useState } from "react";

interface ValuationResult {
  address: string;
  estimatedValue: number;
  lowRange: number;
  highRange: number;
  assessedValue: number;
  taxAmount: number;
  sellScore: number;
  sellScoreLabel: string;
  seasonFactor: string;
  equityEstimate: number | null;
  city: string;
  pricePerSqft: number | null;
  yearBuilt: number | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 65) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-orange-500";
}

function scoreRingColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 65) return "#22c55e";
  if (score >= 50) return "#eab308";
  return "#f97316";
}

export default function SellScoreResult({ result, onReset }: { result: ValuationResult; onReset: () => void }) {
  const [shared, setShared] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  const shareUrl = `https://gardenstate.ai/value`;
  const shareText = `My home's Sell Score is ${result.sellScore}/100! Find out yours free at Garden State AI`;

  function handleShare(platform: string) {
    setShared(true);
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      copy: "",
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      return;
    }

    window.open(urls[platform], "_blank", "width=600,height=400");
  }

  async function handleNativeShare() {
    setShared(true);
    if (navigator.share) {
      await navigator.share({ title: "My Home's Sell Score", text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    }
  }

  // Sell Score ring SVG
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (result.sellScore / 100) * circumference;

  return (
    <>
      {/* Result header */}
      <section className="bg-navy py-8 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <button onClick={onReset} className="text-sm text-gray-400 hover:text-white transition">
            &larr; Check another address
          </button>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl truncate">{result.address}</h1>
          <p className="text-gray-400 text-sm">{result.city && `${result.city}, NJ`}</p>
        </div>
      </section>

      {/* Main result */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Sell Score */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-gray-100 p-8 bg-gray-50">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Your Sell Score</p>
              <div className="relative mt-4">
                <svg width="140" height="140" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={scoreRingColor(result.sellScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 60 60)"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl font-extrabold ${scoreColor(result.sellScore)}`}>
                    {result.sellScore}
                  </span>
                </div>
              </div>
              <p className={`mt-3 text-lg font-bold ${scoreColor(result.sellScore)}`}>
                {result.sellScoreLabel}
              </p>
              <p className="mt-1 text-sm text-gray-500">{result.seasonFactor}</p>
            </div>

            {/* Valuation */}
            <div className="rounded-2xl border-2 border-gray-100 p-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Estimated Value</p>
              <p className="mt-3 text-5xl font-extrabold text-navy">
                {result.estimatedValue > 0 ? fmt(result.estimatedValue) : "Contact us"}
              </p>
              {result.lowRange > 0 && result.highRange > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Range: {fmt(result.lowRange)} &ndash; {fmt(result.highRange)}
                </p>
              )}

              <div className="mt-6 space-y-3">
                {result.assessedValue > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax Assessment</span>
                    <span className="font-semibold text-navy">{fmt(result.assessedValue)}</span>
                  </div>
                )}
                {result.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Annual Taxes</span>
                    <span className="font-semibold text-navy">{fmt(result.taxAmount)}</span>
                  </div>
                )}
                {result.pricePerSqft && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price per Sq Ft</span>
                    <span className="font-semibold text-navy">{fmt(result.pricePerSqft)}</span>
                  </div>
                )}
                {result.yearBuilt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Year Built</span>
                    <span className="font-semibold text-navy">{result.yearBuilt}</span>
                  </div>
                )}
                {result.estimatedValue > 0 && result.assessedValue > 0 && (
                  <div className="flex justify-between text-sm border-t pt-3 mt-3">
                    <span className="text-gray-500">Value vs Assessment</span>
                    <span className={`font-bold ${result.estimatedValue > result.assessedValue ? "text-emerald-600" : "text-red-500"}`}>
                      {result.estimatedValue > result.assessedValue ? "+" : ""}
                      {fmt(result.estimatedValue - result.assessedValue)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Share CTA — the viral engine */}
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">
              {shared ? "Thanks for sharing!" : "Share your Sell Score with friends"}
            </h2>
            <p className="mt-2 text-indigo-100">
              {shared
                ? "Want the full report with comparable sales?"
                : "See what their homes are worth too!"}
            </p>

            {!shared ? (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => handleShare("whatsapp")} className="flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-bold text-white hover:bg-[#20bd5a] transition">
                  <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5"><path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" /></svg>
                  WhatsApp
                </button>
                <button onClick={() => handleShare("facebook")} className="flex items-center gap-2 rounded-xl bg-[#1877F2] px-6 py-3 font-bold text-white hover:bg-[#166fe5] transition">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Facebook
                </button>
                <button onClick={() => handleShare("twitter")} className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 font-bold text-white hover:bg-gray-800 transition">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  Share
                </button>
                <button onClick={handleNativeShare} className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 font-bold text-white hover:bg-white/30 transition md:hidden">
                  Share
                </button>
                <button onClick={() => handleShare("copy")} className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 font-bold text-white hover:bg-white/30 transition hidden md:flex">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  Copy Link
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-4">
                <a
                  href={`https://wa.me/12015281095?text=${encodeURIComponent(`Hi Vale! I just got my Sell Score (${result.sellScore}/100) for ${result.address}. I'd like the full CMA report with comparable sales.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-4 text-lg font-bold text-white hover:bg-[#20bd5a] transition"
                >
                  <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6"><path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" /></svg>
                  Get Full CMA Report on WhatsApp
                </a>
                <a href="/chat?q=CMA" className="text-indigo-200 hover:text-white text-sm underline">
                  Or get it via web chat
                </a>
              </div>
            )}
          </div>

          {/* Next steps */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <a href="/property-tax" className="rounded-xl border-2 border-gray-100 p-6 hover:border-gold hover:shadow-lg transition group">
              <p className="text-2xl">📉</p>
              <h3 className="mt-2 font-bold text-navy group-hover:text-gold transition">Tax Appeal Analysis</h3>
              <p className="mt-1 text-sm text-gray-500">Are you overpaying in property taxes? Find out free.</p>
            </a>
            <a href="/my-home" className="rounded-xl border-2 border-gray-100 p-6 hover:border-gold hover:shadow-lg transition group">
              <p className="text-2xl">📊</p>
              <h3 className="mt-2 font-bold text-navy group-hover:text-gold transition">Track My Home Value</h3>
              <p className="mt-1 text-sm text-gray-500">Get free monthly equity reports and nearby sale alerts.</p>
            </a>
            <a href="/sell-timing" className="rounded-xl border-2 border-gray-100 p-6 hover:border-gold hover:shadow-lg transition group">
              <p className="text-2xl">🕐</p>
              <h3 className="mt-2 font-bold text-navy group-hover:text-gold transition">Sell Now or Wait?</h3>
              <p className="mt-1 text-sm text-gray-500">See projected values at 3, 6, and 12 months.</p>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
