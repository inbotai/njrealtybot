"use client";

import { useState } from "react";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/service-ladder/property-tax/calc";
import type { TaxAppealLead } from "@/lib/service-ladder/property-tax/types";
import type { LadderStage } from "@/lib/service-ladder/types";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface TaxAnalysisResult {
  address: string;
  city: string;
  county: string;
  assessedValue: number;
  taxAnnual: number;
  eqRatio: number;
  eqRatioEffective: number;
  commonLevelRangeLow: number;
  commonLevelRangeHigh: number;
  impliedMarketValue: number;
  estimatedMarketValueLow: number;
  estimatedMarketValueHigh: number;
  estimatedMarketValueMid: number;
  isOverAssessed: boolean;
  overpaymentLow: number;
  overpaymentHigh: number;
  appealLikelihood: "high" | "moderate" | "low";
  filingDeadline: string;
  zestimate?: number | null;
  zestimateSource?: string | null;
  comparables: { address: string; city: string; county: string; salePrice: number; saleDate: string; livingAreaSqft: number | null; bedrooms: number | null; bathrooms: number | null; yearBuilt: number | null; distanceMiles: number | null; propertyType: string }[];
}

// Feature flag: set to true when real payments are wired
const EQUIP_PAYWALL_ENABLED = false;

const DISCLAIMER =
  "This analysis is a general estimate based on public data and NJ Chapter 123. " +
  "It is not legal, tax, or professional advice. Results are approximate and may vary " +
  "based on official assessor information. The success of an appeal is not guaranteed. " +
  "We recommend consulting a tax appeal attorney or licensed property tax consultant " +
  "in New Jersey before taking any action. Garden State AI does not offer guarantees " +
  "and does not represent the taxpayer.";

export default function PropertyTaxAppeal() {
  const [address, setAddress] = useState("");
  const [stage, setStage] = useState<LadderStage>("diagnose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TaxAnalysisResult | null>(null);

  // Rung 3 lead form
  const [leadForm, setLeadForm] = useState<Partial<TaxAppealLead>>({});
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // ── Rung 1: Diagnose ──────────────────────────────────────────

  async function handleDiagnose(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch(`${IDX_API}/api/idx/tax-appeal/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "We couldn't find that property. Try the full street address with city (e.g. \"123 Maple St, Montclair, NJ\").");
        setLoading(false);
        return;
      }
      const result: TaxAnalysisResult = await res.json();
      setAnalysis(result);
      setStage("diagnose");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Rung 2: Equip (generate packet) ───────────────────────────

  function handleGeneratePacket() {
    if (EQUIP_PAYWALL_ENABLED) {
      // TODO: integrate Stripe or payment provider
      alert("Payment integration coming soon.");
      return;
    }
    setStage("equip");
  }

  // ── Rung 3: Connect (lead capture) ────────────────────────────

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to backend lead capture endpoint
    // await provider.captureLead({ ...leadForm, address, county, estimatedOverpayment });
    setLeadSubmitted(true);
    setStage("connect");
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            Are You{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Overpaying
            </span>{" "}
            in Property Taxes?
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Enter your address and find out instantly. Free NJ Chapter 123 analysis with real comparable sales.
          </p>
        </div>
      </section>

      {/* Address input */}
      <section className="py-12">
        <div className="mx-auto max-w-lg px-4">
          <form onSubmit={handleDiagnose} className="flex gap-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Maple St, Montclair, NJ"
              required
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="whitespace-nowrap rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Check My Taxes"}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>
      </section>

      {/* Results */}
      {analysis && (
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4">
            {/* Summary card */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Analysis</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    NJ Chapter 123 Common Level Ratio Analysis
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    analysis.appealLikelihood === "high"
                      ? "bg-green-100 text-green-800"
                      : analysis.appealLikelihood === "moderate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {analysis.appealLikelihood === "high"
                    ? "Strong Case"
                    : analysis.appealLikelihood === "moderate"
                      ? "Possible Case"
                      : "Unlikely Benefit"}
                </span>
              </div>

              {/* Key numbers */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Estimated Overpayment</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {analysis.overpaymentLow === 0 && analysis.overpaymentHigh === 0
                      ? "$0"
                      : `${formatCurrency(analysis.overpaymentLow)} – ${formatCurrency(analysis.overpaymentHigh)}`}
                  </p>
                  <p className="text-xs text-gray-500">per year</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Appeal Likelihood</p>
                  <p className="mt-1 text-2xl font-bold capitalize text-gray-900">
                    {analysis.appealLikelihood}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Filing Deadline</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {analysis.filingDeadline}
                  </p>
                  <p className="text-xs text-gray-500">County Board of Taxation</p>
                </div>
              </div>

              {/* Chapter 123 breakdown */}
              <div className="mt-6 border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700">How We Calculated This</h3>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                    <dt className="text-gray-600">Current Assessment</dt>
                    <dd className="font-medium">{formatCurrency(analysis.impliedMarketValue * analysis.eqRatioEffective)}</dd>
                  </div>
                  <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                    <dt className="text-gray-600">Equalization Ratio</dt>
                    <dd className="font-medium">{formatPercent(analysis.eqRatioEffective)}</dd>
                  </div>
                  <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                    <dt className="text-gray-600">Implied Market Value</dt>
                    <dd className="font-medium">{formatCurrency(analysis.impliedMarketValue)}</dd>
                  </div>
                  <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                    <dt className="text-gray-600">Comp-Based Market Value</dt>
                    <dd className="font-medium">
                      {formatCurrency(analysis.estimatedMarketValueLow)} – {formatCurrency(analysis.estimatedMarketValueHigh)}
                    </dd>
                  </div>
                  {analysis.zestimate && (
                    <div className="flex justify-between rounded bg-emerald-50 px-3 py-2">
                      <dt className="text-gray-600">{analysis.zestimateSource === "redfin" ? "Redfin Estimate" : "Zestimate (Zillow)"}</dt>
                      <dd className="font-semibold text-emerald-700">{formatCurrency(analysis.zestimate)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                    <dt className="text-gray-600">Common Level Range</dt>
                    <dd className="font-medium">
                      {formatPercent(analysis.commonLevelRangeLow)} – {formatPercent(analysis.commonLevelRangeHigh)}
                    </dd>
                  </div>
                  <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                    <dt className="text-gray-600">Over-Assessed?</dt>
                    <dd className={`font-medium ${analysis.isOverAssessed ? "text-red-600" : "text-green-600"}`}>
                      {analysis.isOverAssessed ? "Yes" : "No"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Comps table */}
              <div className="mt-6 border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-700">Comparable Sales Used</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-gray-500">
                        <th className="pb-2 pr-4">Address</th>
                        <th className="pb-2 pr-4">Sale Price</th>
                        <th className="pb-2 pr-4">Sale Date</th>
                        <th className="pb-2 pr-4">Sqft</th>
                        <th className="pb-2 pr-4">Beds</th>
                        <th className="pb-2">Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.comparables.map((comp, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{comp.address}</td>
                          <td className="py-2 pr-4">{formatCurrency(comp.salePrice)}</td>
                          <td className="py-2 pr-4">{comp.saleDate}</td>
                          <td className="py-2 pr-4">{comp.livingAreaSqft?.toLocaleString() ?? "—"}</td>
                          <td className="py-2 pr-4">{comp.bedrooms ?? "—"}</td>
                          <td className="py-2">{comp.distanceMiles} mi</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="mt-6 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                {DISCLAIMER}
              </p>

              {/* CTAs: Rung 2 + Rung 3 */}
              {analysis.isOverAssessed && (
                <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row">
                  {/* Rung 2 */}
                  <button
                    onClick={handleGeneratePacket}
                    className="flex-1 rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400"
                  >
                    Generate My Appeal Packet
                  </button>
                  {/* Rung 3 */}
                  <button
                    onClick={() => setStage("connect")}
                    className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Want a Pro to Handle It?
                  </button>
                </div>
              )}
            </div>

            {/* ── Rung 2: Appeal Packet ──────────────────────────── */}
            {stage === "equip" && analysis.isOverAssessed && (
              <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">Your Appeal Packet</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Everything you need to file your own property tax appeal.
                </p>

                {/* Valuation argument */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Chapter 123 Valuation Argument</h3>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                    Based on {analysis.comparables.length} comparable sales in the immediate area,
                    the true market value of this property is estimated at{" "}
                    {formatCurrency(analysis.estimatedMarketValueLow)} to{" "}
                    {formatCurrency(analysis.estimatedMarketValueHigh)} (average:{" "}
                    {formatCurrency(analysis.estimatedMarketValueMid)}). Under the NJ Chapter 123
                    Common Level Ratio, the county Equalization Ratio is{" "}
                    {formatPercent(analysis.eqRatioEffective)}, which means the fair assessed value
                    should be approximately{" "}
                    {formatCurrency(Math.round(analysis.estimatedMarketValueMid * analysis.eqRatioEffective))}.
                    The current assessment of{" "}
                    {formatCurrency(Math.round(analysis.impliedMarketValue * analysis.eqRatioEffective))}{" "}
                    exceeds this by{" "}
                    {formatCurrency(
                      Math.round(
                        analysis.impliedMarketValue * analysis.eqRatioEffective -
                          analysis.estimatedMarketValueMid * analysis.eqRatioEffective,
                      ),
                    )}
                    , placing the property&apos;s individual ratio above the Common Level Range upper
                    bound of {formatPercent(analysis.commonLevelRangeHigh)}.
                  </p>
                </div>

                {/* Filing checklist */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Filing Checklist</h3>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-gray-700">
                    <li>Download and complete the County Board of Taxation Petition of Appeal form</li>
                    <li>Attach this comparable sales analysis as supporting evidence</li>
                    <li>Include property photos and any independent appraisal (if available)</li>
                    <li>File with the {analysis.comparables[0]?.county || "county"} County Board of Taxation before <strong>{analysis.filingDeadline}</strong></li>
                    <li>Pay the filing fee (typically $5–$25 depending on county)</li>
                    <li>Attend the hearing (usually 15–30 minutes) — bring copies of all documents</li>
                    <li>If denied, you may appeal to the NJ Tax Court within 45 days</li>
                  </ol>
                </div>

                {/* Cover letter placeholder */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Cover Letter</h3>
                  <p className="mt-2 text-sm italic text-gray-500">
                    A personalized cover letter will be generated here by the AI writing layer.
                    It will reference the specific comps and Chapter 123 ratios above.
                    {/* TODO: Wire LLM call to generate cover letter + petition text */}
                  </p>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  {DISCLAIMER}
                </p>
              </div>
            )}

            {/* ── Rung 3: Connect (lead capture) ─────────────────── */}
            {stage === "connect" && !leadSubmitted && (
              <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">Want a Pro to Handle It?</h2>
                <p className="mt-1 text-sm text-gray-500">
                  We&apos;ll match you with a vetted NJ property tax appeal specialist.
                  They handle everything — you just sign.
                </p>
                <form onSubmit={handleLeadSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={leadForm.fullName || ""}
                      onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        value={leadForm.email || ""}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone || ""}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" />
                    <span className="text-[10px] text-gray-500 leading-relaxed">
                      I consent to receive SMS/WhatsApp messages from Garden State AI
                      about my tax appeal and real estate services.
                      Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out.
                      Your mobile info will not be shared with third parties.{" "}
                      <a href="/privacy" target="_blank" className="underline hover:text-gray-700">Privacy Policy</a>
                      {" & "}
                      <a href="/terms" target="_blank" className="underline hover:text-gray-700">Terms</a>.
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400"
                  >
                    Match Me with a Specialist
                  </button>
                </form>
                <p className="mt-3 text-xs text-gray-500">
                  {DISCLAIMER}
                </p>
              </div>
            )}
            {stage === "connect" && leadSubmitted && (
              <div className="mt-8 rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="text-4xl">&#10003;</div>
                <h2 className="mt-2 text-xl font-bold text-gray-900">We&apos;ve Got Your Info</h2>
                <p className="mt-2 text-sm text-gray-500">
                  A vetted NJ tax appeal specialist will reach out within 1–2 business days.
                </p>
              </div>
            )}

            {/* ── Rung 4: Automate (seam only) ───────────────────── */}
            {/*
              TODO — Rung 4: Automate
              When ready, this stage will:
              - Auto-generate and e-file the appeal petition
              - Track case status via county API
              - Auto-notify the homeowner of hearing date
              - Potentially integrate with e-signature for petition signing

              Implementation interface:
              AutomateStage<Chapter123Analysis, { caseId: string; status: string }>
            */}
          </div>
        </section>
      )}

      {/* How it works (shown before any analysis) */}
      {!analysis && !loading && (
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900">How It Works</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-2xl font-bold text-gold">1</div>
                <h3 className="mt-4 font-semibold text-gray-900">Enter Your Address</h3>
                <p className="mt-2 text-sm text-gray-500">
                  We look up your assessment and find recent comparable sales nearby.
                </p>
              </div>
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-2xl font-bold text-gold">2</div>
                <h3 className="mt-4 font-semibold text-gray-900">See Your Savings</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Our NJ Chapter 123 analysis shows if you&apos;re overpaying and by how much.
                </p>
              </div>
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-2xl font-bold text-gold">3</div>
                <h3 className="mt-4 font-semibold text-gray-900">Take Action</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Generate your appeal packet to file yourself, or get matched with a specialist.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
