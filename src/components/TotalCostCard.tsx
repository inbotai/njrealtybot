"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

interface TotalCostProps {
  listPrice: number;
  annualTaxes: number | null;
  assessedValue: number | null;
  hoaMonthly: number | null;
  hoaFrequency: string | null;
  publicRemarks: string | null;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function pmt(annualRate: number, years: number, principal: number): number {
  if (annualRate === 0) return principal / (years * 12);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const RATE_OPTIONS = [
  5.0, 5.25, 5.5, 5.75, 6.0, 6.25, 6.5, 6.75, 7.0, 7.25, 7.5, 7.75, 8.0, 8.25, 8.5,
];

const DOWN_OPTIONS = [
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
  { label: "15%", value: 15 },
  { label: "20%", value: 20 },
  { label: "25%", value: 25 },
  { label: "30%", value: 30 },
];

const STORAGE_KEY = "gs_tco_prefs";

function loadPrefs(): { rate: number; downPct: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePrefs(rate: number, downPct: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate, downPct }));
  } catch { /* ignore */ }
}

/** Normalize HOA to monthly amount */
function normalizeHoa(fee: number | null, frequency: string | null): number {
  if (!fee || fee <= 0) return 0;
  const freq = (frequency || "").toLowerCase();
  if (freq.includes("annual") || freq.includes("yearly")) return fee / 12;
  if (freq.includes("quarter")) return fee / 3;
  if (freq.includes("semi")) return fee / 6;
  // Default: assume monthly
  return fee;
}

export default function TotalCostCard({
  listPrice,
  annualTaxes,
  assessedValue,
  hoaMonthly,
  hoaFrequency,
  publicRemarks,
}: TotalCostProps) {
  const [rate, setRate] = useState(6.75);
  const [downPct, setDownPct] = useState(20);
  const [loaded, setLoaded] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs) {
      setRate(prefs.rate);
      setDownPct(prefs.downPct);
    }
    setLoaded(true);
  }, []);

  // Save preferences when changed
  useEffect(() => {
    if (loaded) savePrefs(rate, downPct);
  }, [rate, downPct, loaded]);

  const hoa = normalizeHoa(hoaMonthly, hoaFrequency);

  const calc = useMemo(() => {
    const downAmount = Math.round(listPrice * downPct / 100);
    const loanAmount = listPrice - downAmount;
    const monthlyMortgage = pmt(rate, 30, loanAmount);

    // Property taxes: use actual if available, else estimate at 2.5% of price (NJ avg)
    const effectiveTax = annualTaxes && annualTaxes > 0 ? annualTaxes : listPrice * 0.025;
    const monthlyTax = effectiveTax / 12;
    const taxEstimated = !(annualTaxes && annualTaxes > 0);

    // Homeowner insurance: 0.5% of home value / 12
    const monthlyInsurance = Math.round(listPrice * 0.005 / 12);

    // Maintenance: 1% of home value / 12
    const monthlyMaintenance = Math.round(listPrice * 0.01 / 12);

    // Flood insurance check
    const remarks = (publicRemarks || "").toLowerCase();
    const floodMentioned = /flood\s*(zone|plain|insurance|area|risk)/i.test(remarks);

    // Total
    const total = monthlyMortgage + monthlyTax + monthlyInsurance + hoa + monthlyMaintenance;

    // Tax appeal potential
    // NJ equalization ratios typically range 80-100%, meaning assessed values
    // are expected to be 80-100% of market value. Using 85% as threshold:
    // if assessed > 85% of list price, the property may be over-assessed
    // relative to what the county's equalization ratio would justify.
    // Example: listed at $500K, assessed at $450K (90%) — borderline.
    // Listed at $400K, assessed at $450K (112%) — clear over-assessment.
    // The savings estimate uses the effective tax rate applied to the
    // over-assessed portion, divided by 12 for monthly savings display.
    let taxAppealSavings = 0;
    if (assessedValue && listPrice && annualTaxes && annualTaxes > 0 && assessedValue > listPrice * 0.85) {
      const overAssessment = assessedValue - listPrice * 0.85;
      if (overAssessment > 0) {
        const taxRate = annualTaxes / assessedValue;
        taxAppealSavings = Math.round(overAssessment * taxRate / 12);
      }
    }

    return {
      downAmount,
      loanAmount,
      monthlyMortgage,
      monthlyTax,
      taxEstimated,
      monthlyInsurance,
      monthlyMaintenance,
      floodMentioned,
      total,
      taxAppealSavings,
    };
  }, [listPrice, downPct, rate, annualTaxes, assessedValue, hoa, publicRemarks]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="rounded-lg bg-navy p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Total Monthly Cost
        </p>
        <p className="mt-1 text-3xl font-extrabold text-white">
          {fmt(calc.total)}
          <span className="text-sm font-normal text-gray-400">/mo</span>
        </p>
        <p className="mt-1 text-[10px] text-gray-500">
          NJ has the highest property taxes in the US. This is your real cost.
        </p>
      </div>

      {/* Breakdown */}
      <div className="mt-4 space-y-2 text-sm">
        <CostRow
          label={`Mortgage (30yr, ${rate}%)`}
          value={calc.monthlyMortgage}
        />
        <CostRow
          label="Property Taxes"
          value={calc.monthlyTax}
          note={calc.taxEstimated ? "Estimated" : undefined}
        />
        <CostRow label="Homeowner Insurance" value={calc.monthlyInsurance} />
        {hoa > 0 && <CostRow label="HOA / Condo Fee" value={hoa} />}
        <CostRow label="Est. Maintenance" value={calc.monthlyMaintenance} />

        {/* Flood note */}
        {calc.floodMentioned && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <span className="mt-0.5 shrink-0">!</span>
            <span>
              Flood insurance may apply. Check{" "}
              <a
                href="https://msc.fema.gov/portal/search"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                FEMA flood maps
              </a>{" "}
              for this property.
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-navy">
          <span>Total</span>
          <span>{fmt(calc.total)}</span>
        </div>
      </div>

      {/* Tax appeal potential */}
      {calc.taxAppealSavings > 0 && (
        <Link
          href="/property-tax"
          className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-800 hover:bg-green-100 transition"
        >
          <span className="text-base">$</span>
          <span>
            <span className="font-bold">Tax Appeal Potential:</span> Save up to{" "}
            <span className="font-bold">{fmt(calc.taxAppealSavings)}/mo</span>
          </span>
        </Link>
      )}

      {/* Customize controls */}
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            Interest Rate
          </label>
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
          >
            {RATE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r.toFixed(2)}%
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600">
            Down Payment
          </label>
          <div className="mt-1 flex gap-1.5 flex-wrap">
            {DOWN_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDownPct(d.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  downPct === d.value
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Down: {fmt(calc.downAmount)} | Loan: {fmt(calc.loanAmount)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">
        Estimates for informational purposes only. Insurance, maintenance, and
        flood costs are approximations. Consult a lender and insurance agent for
        accurate quotes.
      </p>
    </div>
  );
}

function CostRow({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>
        {label}
        {note && (
          <span className="ml-1 text-[10px] text-gray-400">({note})</span>
        )}
      </span>
      <span className="font-medium">{fmt(value)}</span>
    </div>
  );
}

/* ─── Compact version for listing cards ─── */

export function EstTotalMonthlyCost({
  listPrice,
  annualTaxes,
  hoaMonthly,
  hoaFrequency,
}: {
  listPrice: number;
  annualTaxes?: number | null;
  hoaMonthly?: number | null;
  hoaFrequency?: string | null;
}) {
  const total = useMemo(() => {
    const downPct = 20;
    const rate = 6.75;
    const loanAmount = listPrice * (1 - downPct / 100);
    const mortgage = pmt(rate, 30, loanAmount);
    const tax = annualTaxes && annualTaxes > 0 ? annualTaxes / 12 : listPrice * 0.025 / 12;
    const insurance = listPrice * 0.005 / 12;
    const hoa = normalizeHoa(hoaMonthly ?? null, hoaFrequency ?? null);
    const maintenance = listPrice * 0.01 / 12;
    return mortgage + tax + insurance + hoa + maintenance;
  }, [listPrice, annualTaxes, hoaMonthly, hoaFrequency]);

  return (
    <p className="text-xs text-gray-500">
      Est.{" "}
      <span className="font-semibold text-navy">{fmt(total)}/mo</span>{" "}
      total cost
    </p>
  );
}
