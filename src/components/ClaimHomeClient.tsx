"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/service-ladder/property-tax/calc";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

const DISCLAIMER =
  "This analysis is a general estimate based on public data and NJ Chapter 123. " +
  "It is not legal, tax, or professional advice. Results are approximate and may vary " +
  "based on official assessor information. Garden State AI does not offer guarantees " +
  "and does not represent the taxpayer.";

interface ClaimResult {
  id: string;
  estimatedValue: number;
  lowRange: number;
  highRange: number;
  assessedValue: number | null;
  taxAnnual: number | null;
  equity: number | null;
  modIvData: Record<string, any>;
}

export default function ClaimHomeClient() {
  const [step, setStep] = useState<"address" | "details" | "result">("address");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mortgage, setMortgage] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseYear, setPurchaseYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClaimResult | null>(null);

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !name.trim() || !phone.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${IDX_API}/api/idx/claim-home`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.trim(),
          city: city.trim(),
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          mortgageBalance: mortgage ? Number(mortgage.replace(/[^0-9.]/g, "")) : undefined,
          purchasePrice: purchasePrice ? Number(purchasePrice.replace(/[^0-9.]/g, "")) : undefined,
          purchaseYear: purchaseYear ? Number(purchaseYear) : undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not process this address. Try the full street address with city.");
        setLoading(false);
        return;
      }
      const data: ClaimResult = await res.json();
      setResult(data);
      setStep("result");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            Track Your Home&apos;s{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Value
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Free monthly equity report — know what your home is worth, track your equity, and get notified of nearby sales.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-lg px-4">
          {step === "address" && (
            <form onSubmit={(e) => { e.preventDefault(); if (address.trim() && city.trim()) setStep("details"); }} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Claim Your Home</h2>
              <p className="text-sm text-gray-500">Enter your property address to get started.</p>
              <div>
                <label className="text-sm font-medium text-gray-700">Street Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main St" required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Clifton" required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <button type="submit" disabled={!address.trim() || !city.trim()}
                className="w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40">
                Next
              </button>
            </form>
          )}

          {step === "details" && (
            <form onSubmit={handleClaim} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Your Info</h2>
              <p className="text-sm text-gray-500">{address}, {city}, NJ</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Your Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Smith" required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone / WhatsApp</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="(201) 555-0123" required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email (optional)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="john@email.com"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" />
                <span className="text-[10px] text-gray-500 leading-relaxed">
                  I consent to receive SMS/WhatsApp messages from Garden State AI
                  about my home value and real estate services.
                  Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out.
                  Your mobile info will not be shared with third parties.{" "}
                  <a href="/privacy" target="_blank" className="underline hover:text-gray-700">Privacy Policy</a>
                  {" & "}
                  <a href="/terms" target="_blank" className="underline hover:text-gray-700">Terms</a>.
                </span>
              </label>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700">Calculate your equity (optional)</p>
                <p className="text-xs text-gray-400">This helps us show how much you&apos;d walk away with if you sold.</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs text-gray-500">Mortgage Balance</label>
                    <input type="text" value={mortgage} onChange={e => setMortgage(e.target.value)}
                      placeholder="$250,000"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Purchase Price</label>
                    <input type="text" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)}
                      placeholder="$300,000"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Year Purchased</label>
                    <input type="text" value={purchaseYear} onChange={e => setPurchaseYear(e.target.value)}
                      placeholder="2018"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("address")}
                  className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Back
                </button>
                <button type="submit" disabled={loading || !name.trim() || !phone.trim()}
                  className="flex-1 rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-50">
                  {loading ? "Analyzing..." : "Claim My Home"}
                </button>
              </div>
            </form>
          )}

          {step === "result" && result && (
            <div className="space-y-6">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Your Home Dashboard</h2>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Tracking Active</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{address}, {city}, NJ</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-xs font-medium uppercase text-gray-500">Estimated Value</p>
                    <p className="mt-1 text-2xl font-bold text-navy">{formatCurrency(result.estimatedValue)}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(result.lowRange)} – {formatCurrency(result.highRange)}</p>
                  </div>
                  {result.equity !== null && (
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                      <p className="text-xs font-medium uppercase text-gray-500">Your Equity</p>
                      <p className={`mt-1 text-2xl font-bold ${result.equity >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(result.equity)}
                      </p>
                      <p className="text-xs text-gray-400">Value minus mortgage</p>
                    </div>
                  )}
                  {result.assessedValue && (
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                      <p className="text-xs font-medium uppercase text-gray-500">Tax Assessment</p>
                      <p className="mt-1 text-2xl font-bold text-navy">{formatCurrency(result.assessedValue)}</p>
                      {result.taxAnnual && <p className="text-xs text-gray-400">Tax: {formatCurrency(result.taxAnnual)}/yr</p>}
                    </div>
                  )}
                </div>

                {purchasePrice && (
                  <div className="mt-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                    <p className="text-sm font-semibold text-green-800">
                      Since you purchased for {formatCurrency(Number(purchasePrice.replace(/[^0-9.]/g, "")))}
                      {purchaseYear ? ` in ${purchaseYear}` : ""}:
                    </p>
                    <p className="mt-1 text-lg font-bold text-green-700">
                      Your home has gained {formatCurrency(result.estimatedValue - Number(purchasePrice.replace(/[^0-9.]/g, "")))} in value
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900">What Happens Next</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2"><span className="text-gold font-bold">1.</span> You&apos;ll receive a monthly value report via WhatsApp</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">2.</span> We&apos;ll notify you when homes near you sell</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">3.</span> Your report includes updated value, equity, and nearby comps</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">4.</span> Reply STOP anytime to unsubscribe</li>
                </ul>
              </div>

              <div className="mt-3 border-t pt-3">
                <p className="text-[10px] font-semibold text-gray-400">Disclaimer</p>
                <p className="mt-0.5 text-[10px] text-gray-400 leading-relaxed">{DISCLAIMER}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works (shown on address step) */}
      {step === "address" && (
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900">How It Works</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-2xl font-bold text-gold">1</div>
                <h3 className="mt-4 font-semibold text-gray-900">Claim Your Home</h3>
                <p className="mt-2 text-sm text-gray-500">Enter your address and we&apos;ll pull your property data from NJ public records.</p>
              </div>
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-2xl font-bold text-gold">2</div>
                <h3 className="mt-4 font-semibold text-gray-900">Get Your Value</h3>
                <p className="mt-2 text-sm text-gray-500">Instant AI-powered valuation using Zillow, comps, and NJ assessment data.</p>
              </div>
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-2xl font-bold text-gold">3</div>
                <h3 className="mt-4 font-semibold text-gray-900">Monthly Reports</h3>
                <p className="mt-2 text-sm text-gray-500">Get free monthly updates via WhatsApp — value changes, equity, and nearby sales.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
