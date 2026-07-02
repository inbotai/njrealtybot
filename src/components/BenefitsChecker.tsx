"use client";

import { useState } from "react";
import Link from "next/link";
import SmsConsent from "./SmsConsent";
import SaveToLogCTA from "./SaveToLogCTA";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

const INCOME_BANDS = [
  "Under $10,000", "$10,000 - $50,000", "$50,000 - $100,000",
  "$100,000 - $150,000", "$150,000 - $200,000", "$200,000 - $250,000", "Over $250,000",
];

const CURRENT_YEAR = 2026;

interface ProgramResult {
  programId: string;
  programName: string;
  status: string;
  estimatedBenefitLow: number;
  estimatedBenefitHigh: number;
  nextDeadline: { name: string; date: string; description: string } | null;
  explanation: string;
  sourceUrl: string;
  applyUrl: string;
}

interface BenefitsResult {
  totalEstimatedLow: number;
  totalEstimatedHigh: number;
  programs: ProgramResult[];
  disclaimer: string;
  benefitCycle: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  eligible: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Eligible" },
  likely_eligible: { bg: "bg-blue-100", text: "text-blue-800", label: "Likely Eligible" },
  not_eligible: { bg: "bg-gray-100", text: "text-gray-600", label: "Not Eligible" },
  need_more_info: { bg: "bg-amber-100", text: "text-amber-800", label: "Need More Info" },
};

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400_000));
}

export default function BenefitsChecker() {
  const [birthYear, setBirthYear] = useState("");
  const [housingStatus, setHousingStatus] = useState<"homeowner" | "renter">("homeowner");
  const [incomeBand, setIncomeBand] = useState("");
  const [priorIncomeBand, setPriorIncomeBand] = useState("");
  const [yearsAtResidence, setYearsAtResidence] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [isVeteran, setIsVeteran] = useState(false);
  const [isDisabledVet, setIsDisabledVet] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BenefitsResult | null>(null);
  const [error, setError] = useState("");

  // Show Senior Freeze fields if potentially 65+
  const age = birthYear ? CURRENT_YEAR - parseInt(birthYear) : 0;
  const showSeniorFields = age >= 60; // show prior income for anyone close to 65

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthYear || !incomeBand || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${IDX_API}/api/idx/benefits/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birth_year: parseInt(birthYear),
          homeowner_or_renter: housingStatus,
          income_band: incomeBand,
          prior_income_band: priorIncomeBand || incomeBand,
          years_at_residence: parseInt(yearsAtResidence) || 5,
          address: address || undefined,
          city: city || undefined,
          is_veteran: isVeteran,
          is_disabled_veteran: isDisabledVet,
          is_disabled: isDisabled,
        }),
      });

      if (!res.ok) throw new Error("Check failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  // ── Results View ───────────────────────────────────────────

  if (result) {
    const eligible = result.programs.filter(
      (p) => p.status === "eligible" || p.status === "likely_eligible"
    );
    const notEligible = result.programs.filter(
      (p) => p.status === "not_eligible"
    );

    return (
      <>
        {/* Headline number */}
        <section className="bg-white py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            {result.totalEstimatedHigh > 0 ? (
              <>
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">You may qualify for up to</p>
                <p className="mt-2 text-5xl font-extrabold text-navy">
                  ${result.totalEstimatedLow === result.totalEstimatedHigh
                    ? result.totalEstimatedHigh.toLocaleString()
                    : `${result.totalEstimatedLow.toLocaleString()} - ${result.totalEstimatedHigh.toLocaleString()}`
                  }
                </p>
                <p className="mt-1 text-lg text-gray-500">per year in NJ property tax relief</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Results</p>
                <p className="mt-2 text-2xl font-bold text-navy">No programs matched right now</p>
                <p className="mt-1 text-gray-500">But some programs may open up — see the details below</p>
              </>
            )}
          </div>
        </section>

        {/* Program cards */}
        <section className="bg-gray-50 py-10">
          <div className="mx-auto max-w-3xl px-4 space-y-4">
            {/* Eligible first */}
            {eligible.map((p) => (
              <ProgramCard key={p.programId} program={p} />
            ))}

            {/* Not eligible — collapsed */}
            {notEligible.length > 0 && (
              <details className="rounded-xl border bg-white shadow-sm">
                <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-gray-500">
                  {notEligible.length} program{notEligible.length > 1 ? "s" : ""} you don't currently qualify for (click to see why)
                </summary>
                <div className="px-6 pb-4 space-y-3">
                  {notEligible.map((p) => (
                    <ProgramCard key={p.programId} program={p} compact />
                  ))}
                </div>
              </details>
            )}

            {/* Auto-save to MyHome Log */}
            <SaveToLogCTA
              toolType="tax_appeal"
              address={address}
              city={city}
              data={{ programs: eligible.map((p) => p.programName), total: result.totalEstimatedHigh }}
              headline="Save your benefits check to your MyHome Log"
            />

            {/* Disclaimer */}
            <p className="text-[11px] text-gray-400 text-center leading-relaxed mt-6">
              {result.disclaimer}
            </p>

            {/* Re-check */}
            <div className="text-center">
              <button onClick={() => setResult(null)} className="text-sm text-indigo-600 hover:underline">
                Check again with different inputs
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── Form View ──────────────────────────────────────────────

  return (
    <>
      {/* Hero */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy leading-tight">
            You May Be Owed Money by{" "}
            <span className="text-gold">New Jersey</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            ANCHOR, Senior Freeze, StayNJ — check all your property tax relief programs in 60 seconds. Free.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left — form */}
            <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-navy">Quick Check</h2>

              {/* Birth year */}
              <div>
                <label className="text-sm font-medium text-gray-700">Year of birth</label>
                <input type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="1960" min="1920" max="2010"
                  className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" required />
              </div>

              {/* Homeowner / Renter */}
              <div>
                <label className="text-sm font-medium text-gray-700">I am a</label>
                <div className="mt-1 flex gap-2">
                  {(["homeowner", "renter"] as const).map((opt) => (
                    <button key={opt} type="button" onClick={() => setHousingStatus(opt)}
                      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                        housingStatus === opt ? "border-navy bg-navy text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}>
                      {opt === "homeowner" ? "Homeowner" : "Renter"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current income */}
              <div>
                <label className="text-sm font-medium text-gray-700">2025 gross income (approximate)</label>
                <select value={incomeBand} onChange={(e) => setIncomeBand(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" required>
                  <option value="">Select range</option>
                  {INCOME_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Prior year income (for Senior Freeze two-year test) */}
              {showSeniorFields && (
                <div>
                  <label className="text-sm font-medium text-gray-700">2024 gross income (for Senior Freeze)</label>
                  <select value={priorIncomeBand} onChange={(e) => setPriorIncomeBand(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm">
                    <option value="">Same as 2025</option>
                    {INCOME_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {/* Years at residence */}
              {housingStatus === "homeowner" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Years at current NJ home</label>
                  <input type="number" value={yearsAtResidence} onChange={(e) => setYearsAtResidence(e.target.value)}
                    placeholder="5" min="0" max="60"
                    className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" />
                </div>
              )}

              {/* Address (optional — for MOD-IV property tax lookup) */}
              {housingStatus === "homeowner" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Address <span className="text-gray-400 font-normal">(optional — improves StayNJ estimate)</span></label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St" className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" />
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="City" className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm" />
                </div>
              )}

              {/* Optional checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={isVeteran} onChange={(e) => setIsVeteran(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300" />
                  Veteran (honorable discharge)
                </label>
                {isVeteran && (
                  <label className="flex items-center gap-2 text-sm text-gray-700 ml-6">
                    <input type="checkbox" checked={isDisabledVet} onChange={(e) => setIsDisabledVet(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300" />
                    100% VA disabled
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={isDisabled} onChange={(e) => setIsDisabled(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300" />
                  Disabled (non-veteran)
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={loading || !birthYear || !incomeBand}
                className="w-full rounded-lg bg-navy py-3 font-bold text-white hover:bg-indigo-900 transition disabled:opacity-40">
                {loading ? "Checking..." : "Check My Benefits — Free"}
              </button>

              <p className="text-[10px] text-gray-400 text-center">
                Your income and age are never stored in analytics or shared. <Link href="/privacy" className="underline">Privacy Policy</Link>
              </p>
            </form>

            {/* Right — example result */}
            <div>
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-3">Example Result</p>

                <div className="text-center mb-4">
                  <p className="text-xs text-emerald-600 font-medium">You may qualify for up to</p>
                  <p className="text-3xl font-extrabold text-navy">$5,250</p>
                  <p className="text-xs text-gray-500">per year in property tax relief</p>
                </div>

                <div className="space-y-2">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-emerald-800">ANCHOR</span>
                      <span className="text-sm font-bold text-emerald-700">$1,750/yr</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">Senior homeowner, income under $150K</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-blue-800">StayNJ</span>
                      <span className="text-sm font-bold text-blue-700">$3,250/yr</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">50% of $10K taxes after ANCHOR offset</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-purple-800">Veteran Deduction</span>
                      <span className="text-sm font-bold text-purple-700">$250/yr</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">Honorable discharge, NJ homeowner</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-xs font-semibold text-amber-700">Deadline: Nov 2, 2026</p>
                  <p className="text-xs text-amber-600">File PAS-1 at propertytaxrelief.nj.gov</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-400 text-center">
                This is an example. Your results will be based on your actual inputs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Program Card ─────────────────────────────────────────────

function ProgramCard({ program: p, compact }: { program: ProgramResult; compact?: boolean }) {
  const style = STATUS_STYLES[p.status] || STATUS_STYLES.not_eligible;
  const isEligible = p.status === "eligible" || p.status === "likely_eligible";

  return (
    <div className={`rounded-xl border ${isEligible ? "border-emerald-200 bg-white" : "border-gray-200 bg-gray-50"} ${compact ? "p-4" : "p-6"} shadow-sm`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`${compact ? "text-sm" : "text-lg"} font-bold text-gray-900`}>{p.programName}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>
          </div>
          <p className={`mt-1 ${compact ? "text-xs" : "text-sm"} text-gray-600`}>{p.explanation}</p>
        </div>
        {isEligible && (
          <div className="text-right shrink-0">
            <p className={`${compact ? "text-lg" : "text-2xl"} font-extrabold text-emerald-600`}>
              {p.estimatedBenefitLow === p.estimatedBenefitHigh
                ? `$${p.estimatedBenefitHigh.toLocaleString()}`
                : `$${p.estimatedBenefitLow.toLocaleString()}-$${p.estimatedBenefitHigh.toLocaleString()}`
              }
            </p>
            <p className="text-xs text-gray-500">/year</p>
          </div>
        )}
      </div>

      {/* Deadline + apply link */}
      {(p.nextDeadline || isEligible) && !compact && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {p.nextDeadline && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
              Deadline: {new Date(p.nextDeadline.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {" "}({daysUntil(p.nextDeadline.date)} days)
            </span>
          )}
          <a href={p.applyUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-600 hover:underline">
            How to apply &rarr;
          </a>
          <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:underline">
            Official source
          </a>
        </div>
      )}
    </div>
  );
}
