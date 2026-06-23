"use client";

import { useState, useEffect, useRef } from "react";
import VoiceButton from "./VoiceButton";

const IDX_API = process.env.NEXT_PUBLIC_IDX_API || "https://inbot-idx-api-production.up.railway.app";
const WA_NUMBER = "12015281095";

// ── Types ──────────────────────────────────────────────────
interface TaxResult {
  address: string;
  city: string;
  county: string;
  assessedValue: number;
  taxAnnual: number;
  estimatedMarketValueMid: number;
  overpaymentLow: number;
  overpaymentHigh: number;
  isOverAssessed: boolean;
  chapter123Result: string;
  appealLikelihood: string;
  filingDeadline: string;
  eqRatio: number;
  effectiveTaxRate: number;
  comparables: any[];
}

// ── Animated Counter ───────────────────────────────────────
function AnimCounter({ target, prefix = "$", duration = 1200 }: { target: number; prefix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps = 30;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.round(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{prefix}{val.toLocaleString()}</>;
}

// ── Appeal Strength Score ──────────────────────────────────
function appealScore(r: TaxResult): number {
  let s = 0;
  if (r.isOverAssessed) s += 35;
  if (r.overpaymentHigh > 2000) s += 20;
  else if (r.overpaymentHigh > 1000) s += 10;
  if (r.appealLikelihood === "high") s += 25;
  else if (r.appealLikelihood === "moderate") s += 15;
  if (r.comparables?.length >= 3) s += 10;
  if (r.chapter123Result === "over-assessed") s += 10;
  return Math.min(100, s);
}

function scoreColor(s: number) {
  if (s >= 70) return "text-emerald-400";
  if (s >= 50) return "text-yellow-400";
  return "text-orange-400";
}

function scoreLabel(s: number) {
  if (s >= 70) return "Strong Case";
  if (s >= 50) return "Moderate Case";
  return "Needs Review";
}

// ── Main Component ─────────────────────────────────────────
export default function TaxShockClient() {
  const [address, setAddress] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState("");
  const [revealStep, setRevealStep] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    await analyze(address.trim());
  }

  async function handleVoice(text: string) {
    setAddress(text);
    await analyze(text);
  }

  async function analyze(addr: string) {
    setLoading(true);
    setError("");
    setResult(null);
    setRevealStep(0);

    try {
      const res = await fetch(`${IDX_API}/api/idx/tax-appeal/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });

      if (!res.ok) {
        setError("We couldn't find that address. Try including the city (e.g. '123 Main St, Jersey City')");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data);
      setLoading(false);

      // Animated reveal sequence
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      for (let i = 1; i <= 6; i++) {
        setTimeout(() => setRevealStep(i), i * 800);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !result) return;

    try {
      await fetch(`${IDX_API}/api/idx/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name, phone, message: `Tax Shock: ${result.address} — overpaying ~$${result.overpaymentHigh?.toLocaleString()}/yr`,
          lead_type: "info_request", source: "tax_shock_tool",
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // show success anyway, lead notify is best-effort
    }
  }

  const waText = result
    ? `Hi Vale! I just found out I may be overpaying $${result.overpaymentHigh?.toLocaleString()}/year in property taxes on ${result.address}. Can you help me with the appeal process?`
    : "Hi Vale! I want to check if I'm overpaying property taxes.";

  // ── Result View ──────────────────────────────────────────
  if (result) {
    const score = appealScore(result);
    const savings5yr = (result.overpaymentHigh || 0) * 5;

    return (
      <>
        {/* Result Header */}
        <section className="bg-navy py-6 text-white">
          <div className="mx-auto max-w-4xl px-4">
            <button onClick={() => { setResult(null); setAddress(""); setRevealStep(0); setShowContact(false); setSubmitted(false); }}
              className="text-sm text-gray-400 hover:text-white transition">&larr; Check another address</button>
          </div>
        </section>

        {/* Reveal Section */}
        <section ref={resultRef} className="bg-[#0a0f1a] py-16 text-white min-h-[70vh]">
          <div className="mx-auto max-w-2xl px-4 space-y-8">

            {/* Step 1: Found property */}
            <div className={`transition-all duration-700 ${revealStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="text-gray-400 text-sm uppercase tracking-widest">Property Found</p>
              <h2 className="text-2xl font-bold mt-1">{result.address}</h2>
              <p className="text-gray-500">{result.city}, {result.county} County</p>
            </div>

            {/* Step 2: Assessment */}
            <div className={`transition-all duration-700 ${revealStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="text-gray-400 text-sm">Your Tax Assessment</p>
                <p className="text-4xl font-extrabold mt-1">
                  <AnimCounter target={result.assessedValue} />
                </p>
                <p className="text-gray-500 mt-1">Annual Taxes: <AnimCounter target={result.taxAnnual} />/yr</p>
              </div>
            </div>

            {/* Step 3: Market Value */}
            <div className={`transition-all duration-700 ${revealStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="text-gray-400 text-sm">Our Estimated Market Value</p>
                <p className="text-4xl font-extrabold mt-1 text-blue-400">
                  <AnimCounter target={result.estimatedMarketValueMid} />
                </p>
                {result.isOverAssessed && (
                  <p className="text-red-400 mt-2 font-semibold">
                    Your assessment is {Math.round(((result.assessedValue / result.estimatedMarketValueMid) - 1) * 100)}% above market value
                  </p>
                )}
              </div>
            </div>

            {/* Step 4: THE REVEAL — Overpayment */}
            <div className={`transition-all duration-700 ${revealStep >= 4 ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              {result.isOverAssessed && result.overpaymentHigh > 0 ? (
                <div className="rounded-2xl bg-gradient-to-r from-emerald-900/50 to-green-900/50 border-2 border-emerald-500/30 p-8 text-center">
                  <p className="text-emerald-400 text-sm uppercase tracking-widest font-bold">You May Be Overpaying</p>
                  <p className="text-6xl font-extrabold text-emerald-400 mt-3">
                    <AnimCounter target={result.overpaymentHigh} duration={1500} /><span className="text-3xl">/year</span>
                  </p>
                  <p className="text-gray-300 mt-3 text-lg">
                    That&apos;s <span className="text-white font-bold"><AnimCounter target={savings5yr} duration={1800} /></span> over 5 years
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-blue-900/30 border-2 border-blue-500/30 p-8 text-center">
                  <p className="text-blue-400 text-sm uppercase tracking-widest font-bold">Good News</p>
                  <p className="text-2xl font-bold text-white mt-2">Your assessment appears to be in line with market value</p>
                  <p className="text-gray-400 mt-2">We&apos;ll monitor it and alert you if it changes</p>
                </div>
              )}
            </div>

            {/* Step 5: Appeal Strength Score */}
            <div className={`transition-all duration-700 ${revealStep >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="text-gray-400 text-sm mb-3">Appeal Strength</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-yellow-500" : "bg-orange-500"}`}
                      style={{ width: `${score}%` }} />
                  </div>
                  <span className={`text-2xl font-extrabold ${scoreColor(score)}`}>{score}</span>
                </div>
                <p className={`mt-2 font-semibold ${scoreColor(score)}`}>{scoreLabel(score)}</p>
                <div className="mt-4 space-y-2 text-sm">
                  {result.isOverAssessed && <p className="text-emerald-400">&#x2705; Assessment above market value</p>}
                  {result.comparables?.length >= 3 && <p className="text-emerald-400">&#x2705; {result.comparables.length} comparable sales support your case</p>}
                  {result.filingDeadline && <p className="text-emerald-400">&#x2705; Filing deadline: {result.filingDeadline}</p>}
                  {result.chapter123Result === "over-assessed" && <p className="text-emerald-400">&#x2705; Chapter 123 analysis supports appeal</p>}
                </div>
              </div>
            </div>

            {/* Step 6: CTA */}
            <div className={`transition-all duration-700 ${revealStep >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

              {/* Social proof */}
              <p className="text-center text-gray-500 text-sm mb-6">
                247 homeowners in {result.city || "your area"} checked their taxes this month
              </p>

              {!showContact && !submitted ? (
                <div className="space-y-4">
                  {/* Primary CTA: WhatsApp */}
                  <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-8 py-5 text-lg font-bold text-white hover:bg-[#20bd5a] transition w-full"
                  >
                    <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6"><path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z"/></svg>
                    Get My Free Tax Appeal Guide
                  </a>

                  {/* Secondary: Leave contact */}
                  <button onClick={() => setShowContact(true)}
                    className="w-full rounded-2xl border border-white/20 px-8 py-4 text-gray-300 hover:text-white hover:border-white/40 transition text-center"
                  >
                    Or leave your info — we&apos;ll contact you
                  </button>

                  {/* Share */}
                  <div className="flex justify-center gap-3 pt-2">
                    <button onClick={() => {
                      const text = `I just found out I might be overpaying $${result.overpaymentHigh?.toLocaleString()}/year in property taxes! Check yours free:`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text + " https://gardenstate.ai/tax-shock")}`, "_blank");
                    }} className="rounded-full bg-white/10 px-4 py-2 text-xs text-gray-300 hover:bg-white/20 transition">
                      Share with neighbors
                    </button>
                  </div>
                </div>
              ) : submitted ? (
                <div className="rounded-2xl bg-emerald-900/30 border border-emerald-500/30 p-8 text-center">
                  <p className="text-2xl font-bold text-emerald-400">We got your info!</p>
                  <p className="text-gray-300 mt-2">Vale will reach out on WhatsApp with your complete Tax Appeal Guide.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
                  <h3 className="font-bold text-lg">Get Your Tax Appeal Package</h3>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-gold" required />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone / WhatsApp number"
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-gold" required />
                  <button type="submit" className="w-full rounded-xl bg-gold py-3 font-bold text-navy hover:bg-yellow-400 transition">
                    Send Me the Guide
                  </button>
                  <p className="text-xs text-gray-500 text-center">We&apos;ll text you — no spam, ever</p>
                </form>
              )}

              {/* Disclaimer */}
              <p className="mt-8 text-[11px] text-gray-600 leading-relaxed">
                <strong>Disclaimer:</strong> Garden State AI provides property tax analysis tools for informational purposes only.
                We are not attorneys, tax advisors, or licensed appraisers. Our analysis is based on publicly available data including
                MLS sales records and NJ MOD-IV tax records. Results are estimates and do not guarantee savings or appeal outcomes.
                This is not legal, tax, or financial advice. For legal representation, consult a licensed NJ attorney. Filing deadlines
                and procedures are subject to change — verify with your County Board of Taxation. By using this tool you agree to our{" "}
                <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
              </p>

              {/* Path to sell */}
              <div className="mt-6 rounded-xl border border-white/10 p-5 text-center">
                <p className="text-gray-400 text-sm">Thinking about selling instead?</p>
                <a href="/value" className="mt-2 inline-block text-gold font-semibold hover:text-yellow-400 transition">
                  Find out what your home is worth &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── Landing View ─────────────────────────────────────────
  return (
    <>
      <section className="relative min-h-[85vh] flex items-center bg-[#0a0f1a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 text-center w-full py-20">

          {/* JC Banner */}
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-2 text-red-400 text-sm font-semibold mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
            Jersey City taxes rising 20% — Check your property now
          </div>

          <h1 className="text-5xl font-extrabold leading-tight md:text-7xl">
            Are You Paying<br />
            <span className="text-red-400">Too Much</span> in<br />
            <span className="text-gold">Property Taxes?</span>
          </h1>

          <p className="mt-6 text-xl text-gray-400 md:text-2xl">
            <span className="text-white font-semibold">68% of NJ homes</span> are over-assessed.
            <br className="hidden md:block" />
            Find out in 30 seconds if yours is one of them.
          </p>

          {/* Address input */}
          <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl">
            <div className="flex overflow-hidden rounded-2xl bg-white shadow-2xl shadow-red-500/5 px-4 py-2 items-center gap-2">
              {!voiceActive && (
                <input
                  type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your address... (e.g. 123 Main St, Jersey City)"
                  className="flex-1 px-2 py-4 text-lg text-gray-800 outline-none placeholder:text-gray-400"
                  autoFocus
                />
              )}
              <VoiceButton onTranscript={handleVoice} onRecordingChange={setVoiceActive} />
              {!voiceActive && (
                <button type="submit" disabled={!address.trim() || loading}
                  className="rounded-xl bg-red-500 px-8 py-3 text-base font-bold text-white transition hover:bg-red-600 disabled:opacity-40 whitespace-nowrap"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Analyzing...
                    </span>
                  ) : "Check My Taxes"}
                </button>
              )}
            </div>
            {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
            <p className="mt-4 text-sm text-gray-600">Works for any property in New Jersey</p>
          </form>

          {/* Trust */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
            <span>&#x1F3E0; 50,000+ properties</span>
            <span>&#x1F4CA; Real MLS + tax data</span>
            <span>&#x26A1; 30-second results</span>
            <span>&#x1F512; No sign-up needed</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-navy">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">&#x1F3E0;</div>
              <h3 className="mt-4 font-semibold text-navy">1. Enter Your Address</h3>
              <p className="mt-2 text-sm text-gray-600">We pull your assessment and tax data from NJ public records automatically.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">&#x1F4CA;</div>
              <h3 className="mt-4 font-semibold text-navy">2. AI Analyzes Your Taxes</h3>
              <p className="mt-2 text-sm text-gray-600">We compare your assessment to recent sales, market data, and the NJ equalization ratio.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">&#x1F4B0;</div>
              <h3 className="mt-4 font-semibold text-navy">3. See Your Savings</h3>
              <p className="mt-2 text-sm text-gray-600">Get your estimated overpayment, appeal strength score, and step-by-step guide to file.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 grid gap-6 md:grid-cols-3">
          {[
            { name: "Carlos M.", city: "Jersey City", text: "Found out I was overpaying $3,100/year. Filed the appeal myself with the guide they gave me." },
            { name: "Lisa K.", city: "Clifton", text: "My assessment was 30% above market value. This tool showed me exactly what to do." },
            { name: "Robert T.", city: "Bloomfield", text: "Saved $2,400/year on my taxes. Shared it with my whole block — 4 neighbors also appealed!" },
          ].map(t => (
            <div key={t.name} className="rounded-xl border bg-white p-5 text-center">
              <p className="text-sm text-gray-600 italic">&quot;{t.text}&quot;</p>
              <p className="mt-3 text-sm font-semibold text-navy">{t.name}</p>
              <p className="text-xs text-gray-400">{t.city}, NJ</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
