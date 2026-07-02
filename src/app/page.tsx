"use client";

import { useState } from "react";
import { useAdmin } from "@/components/AdminAuth";
import { useRouter } from "next/navigation";
import HomeHero from "@/components/HomeHero";
import ProofStrip from "@/components/ProofStrip";
import { submitLead } from "@/lib/api";
import NewsletterSignup from "@/components/NewsletterSignup";
import SmsConsent from "@/components/SmsConsent";

const WA_LINK = "https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate";

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
    if (!login(password)) { setPwMsg("Current password is incorrect"); return; }
    if (newPw.length < 4) { setPwMsg("Minimum 4 characters"); return; }
    if (newPw !== confirmPw) { setPwMsg("Passwords don't match"); return; }
    if (changePassword(newPw)) {
      setPwMsg("Password updated!");
      setNewPw(""); setConfirmPw(""); setPassword("");
      setTimeout(() => { setShowChangePw(false); setPwMsg(""); }, 1500);
    }
  }

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "name": "Garden State AI",
            "url": "https://gardenstate.ai",
            "logo": "https://gardenstate.ai/icon.svg",
            "description": "AI-powered home value, property tax, and selling intelligence for New Jersey homeowners.",
            "areaServed": { "@type": "State", "name": "New Jersey" }
          },
          {
            "@type": "WebSite",
            "name": "Garden State AI",
            "url": "https://gardenstate.ai",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://gardenstate.ai/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]
      }) }} />

      {/* Hero — address-first with My Home / Search tabs */}
      <HomeHero />

      {/* Proof strip */}
      <ProofStrip />

      {/* Tool cards */}
      <section className="py-14 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Home Value — full width, dark bg */}
            <a href="/sell" className="group relative col-span-full overflow-hidden rounded-2xl bg-navy p-7 text-left shadow-lg transition hover:shadow-2xl hover:scale-[1.01]">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />
              <div className="relative">
                <span className="inline-block rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold mb-3">Most Popular</span>
                <h3 className="text-2xl font-bold text-white">Your Home's Value Changed This Month</h3>
                <p className="mt-2 text-base text-gray-300">NJ home prices shifted in June. Your neighbors already checked — <span className="text-gold font-semibold">have you?</span></p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy group-hover:gap-3 transition-all">
                  Get My Number — Free <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </span>
              </div>
            </a>

            {/* Tax — dark red */}
            <a href="/tax-shock" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900 to-red-800 p-6 text-left shadow-md transition hover:shadow-xl hover:scale-[1.02]">
              <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-red-500/20 blur-xl" />
              <div className="relative">
                <span className="inline-block rounded-full bg-red-500/30 px-2.5 py-0.5 text-xs font-bold text-red-300 mb-3">Deadline Approaching</span>
                <h3 className="text-xl font-bold text-white">NJ Raised Taxes Again</h3>
                <p className="mt-2 text-sm text-red-100/80">Over-assessed homes lose <span className="text-red-300 font-semibold">$1,000–$3,000/year</span> in taxes they don't owe. 60-second check.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-300 group-hover:gap-2 transition-all">Am I Overpaying? &rarr;</span>
              </div>
            </a>

            {/* Reno — dark green */}
            <a href="/renovate" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-800 p-6 text-left shadow-md transition hover:shadow-xl hover:scale-[1.02]">
              <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-emerald-500/20 blur-xl" />
              <div className="relative">
                <h3 className="text-xl font-bold text-white">Before You Renovate, Check the ROI</h3>
                <p className="mt-2 text-sm text-emerald-100/80">Not every upgrade adds value. Some <span className="text-emerald-300 font-semibold">lose you money</span> at resale. See the data before you spend.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 group-hover:gap-2 transition-all">Calculate ROI &rarr;</span>
              </div>
            </a>

            {/* MyHome Log — dark indigo */}
            <a href="/my-home" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 p-6 text-left shadow-md transition hover:shadow-xl hover:scale-[1.02]">
              <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-indigo-500/20 blur-xl" />
              <div className="relative">
                <span className="inline-block rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-300 mb-3">Free</span>
                <h3 className="text-xl font-bold text-white">Every Receipt You Lose Costs You at Closing</h3>
                <p className="mt-2 text-sm text-indigo-100/80">Track improvements, build a verified history. <span className="text-indigo-300 font-semibold">Documented homes sell for more.</span></p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 group-hover:gap-2 transition-all">Start My Log &rarr;</span>
              </div>
            </a>

            {/* Sell Timing — dark blue */}
            <a href="/sell-timing" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-cyan-900 p-6 text-left shadow-md transition hover:shadow-xl hover:scale-[1.02]">
              <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-blue-500/20 blur-xl" />
              <div className="relative">
                <h3 className="text-xl font-bold text-white">Every Month You Wait Could Cost — or Earn — You Thousands</h3>
                <p className="mt-2 text-sm text-blue-100/80">See your town's <span className="text-cyan-300 font-semibold">real market data</span>: is demand rising or dropping? The answer changes your price.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 group-hover:gap-2 transition-all">See My Timing &rarr;</span>
              </div>
            </a>
          </div>

          {/* Vale card */}
          <div className="mt-4 rounded-2xl border border-[#25D366]/30 bg-gradient-to-r from-[#25D366]/10 via-white to-[#25D366]/10 p-5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white">
                <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6">
                  <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
                </svg>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-bold text-navy">Ask Vale Anything</h3>
                <p className="text-sm text-gray-500">Your AI real-estate partner, 24/7 on WhatsApp. "What did homes sell for on my street?"</p>
              </div>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20bd5a] hover:shadow-lg whitespace-nowrap"
              >
                Message Vale
              </a>
            </div>
          </div>

          {/* Ready to Sell — full width CTA */}
          <a href="/list" className="mt-4 group relative flex overflow-hidden rounded-2xl border-2 border-navy bg-navy p-6 text-left shadow-md transition hover:shadow-xl hover:scale-[1.01]">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
            <div className="relative flex items-center gap-5 w-full">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold text-navy">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">I'm Ready to Sell</h3>
                <p className="mt-1 text-sm text-gray-400">AI-powered marketing + licensed agent. Your home deserves maximum exposure.</p>
              </div>
              <svg className="h-6 w-6 shrink-0 text-gold group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </div>
          </a>
        </div>
      </section>

      {/* MyHome Log CTA section — kept from original */}
      <MyHomeLogSection />

      {/* Newsletter */}
      <section className="bg-white py-6">
        <div className="mx-auto max-w-2xl px-4">
          <NewsletterSignup />
        </div>
      </section>

      {/* Agent login — subtle */}
      <AgentAccess isAdmin={isAdmin} login={login} logout={logout}
        password={password} setPassword={setPassword} error={error}
        handleLogin={handleLogin}
        showChangePw={showChangePw} setShowChangePw={setShowChangePw}
        newPw={newPw} setNewPw={setNewPw} confirmPw={confirmPw} setConfirmPw={setConfirmPw}
        pwMsg={pwMsg} handleChangePw={handleChangePw}
      />
    </>
  );
}

// ── MyHome Log section (preserved from original) ─────────────

function MyHomeLogSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-200/40 via-purple-200/30 to-gold/20 blur-xl" />
            <div className="relative rounded-2xl bg-white border border-gray-200 shadow-xl p-6 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                <span className="text-xl">&#127968;</span>
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
                <span className="text-xl">&#127859;</span>
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
                <span className="text-xl">&#128295;</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">HVAC Service</p>
                  <p className="text-xs text-gray-500">Comfort Air NJ &middot; Annual tune-up</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-navy">$185</p>
                  <p className="text-xs text-gray-400">Maintenance</p>
                </div>
              </div>
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
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Free for all homeowners
            </div>
            <h2 className="text-3xl font-bold text-navy leading-tight">
              Every Dollar You Put Into Your Home
              <span className="text-gold"> Should Pay You Back</span>
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Track every repair, upgrade, and improvement — with AI that calculates exactly how much value each one adds. When it's time to sell, your MyHome Log becomes your secret weapon.
            </p>
            <ul className="mt-5 space-y-2.5">
              {["AI estimates value impact of every improvement",
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
            <div className="mt-8">
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
  );
}

// ── Agent Access (subtle login) ──────────────────────────────

function AgentAccess({ isAdmin, login, logout, password, setPassword, error, handleLogin, showChangePw, setShowChangePw, newPw, setNewPw, confirmPw, setConfirmPw, pwMsg, handleChangePw }: any) {
  const [show, setShow] = useState(false);

  if (isAdmin) {
    return (
      <div className="py-4 text-center">
        <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600">Sign Out</button>
        {" | "}
        <button onClick={() => setShowChangePw(!showChangePw)} className="text-xs text-gray-400 hover:text-gray-600">Change Password</button>
        {showChangePw && (
          <form onSubmit={handleChangePw} className="mx-auto mt-3 max-w-xs space-y-2">
            <input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="Current password" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input type="password" value={newPw} onChange={(e: any) => setNewPw(e.target.value)} placeholder="New password" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input type="password" value={confirmPw} onChange={(e: any) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <button type="submit" className="w-full rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white">Update</button>
            {pwMsg && <p className="text-xs text-gray-500">{pwMsg}</p>}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="py-6 text-center">
      {!show ? (
        <button onClick={() => setShow(true)} className="text-xs text-gray-400 hover:text-gray-600 transition">
          Agent Access
        </button>
      ) : (
        <form onSubmit={handleLogin} className="mx-auto max-w-xs space-y-2">
          <div className="flex gap-2">
            <input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="Password" autoFocus
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <button type="submit" disabled={!password.trim()} className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40">Enter</button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      )}
    </div>
  );
}
