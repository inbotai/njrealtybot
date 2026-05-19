"use client";

import { useState, useMemo } from "react";

interface Props {
  listPrice: number;
  annualTaxes: number | null;
  hoaMonthly: number | null;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function pmt(rate: number, nper: number, pv: number): number {
  if (rate === 0) return pv / nper;
  const r = rate / 12;
  return (pv * r * Math.pow(1 + r, nper)) / (Math.pow(1 + r, nper) - 1);
}

const DOWN_PRESETS = [5, 10, 15, 20, 25];
const TERM_OPTIONS = [
  { label: "30-Year Fixed", years: 30 },
  { label: "15-Year Fixed", years: 15 },
];

export default function MortgageCalculator({ listPrice, annualTaxes, hoaMonthly }: Props) {
  const [offerPrice, setOfferPrice] = useState(listPrice);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.875);
  const [termYears, setTermYears] = useState(30);
  const [taxes, setTaxes] = useState(annualTaxes ?? Math.round(listPrice * 0.018));
  const [insurance, setInsurance] = useState(Math.round(listPrice * 0.004));
  const [hoa, setHoa] = useState(hoaMonthly ?? 0);

  const calc = useMemo(() => {
    const downAmount = Math.round(offerPrice * downPct / 100);
    const loanAmount = offerPrice - downAmount;
    const monthlyPI = pmt(rate / 100, termYears * 12, loanAmount);
    const monthlyTax = taxes / 12;
    const monthlyIns = insurance / 12;
    const total = monthlyPI + monthlyTax + monthlyIns + hoa;
    return { downAmount, loanAmount, monthlyPI, monthlyTax, monthlyIns, total };
  }, [offerPrice, downPct, rate, termYears, taxes, insurance, hoa]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-navy">Mortgage Calculator</h2>
      <p className="mt-1 text-sm text-gray-500">Estimate your monthly payment</p>

      {/* Total monthly */}
      <div className="mt-4 rounded-lg bg-navy p-4 text-center">
        <p className="text-sm text-gray-300">Estimated Monthly Payment</p>
        <p className="text-3xl font-extrabold text-white">{fmt(calc.total)}<span className="text-sm font-normal text-gray-400">/mo</span></p>
      </div>

      {/* Breakdown */}
      <div className="mt-4 space-y-2 text-sm">
        <Row label="Principal & Interest" value={calc.monthlyPI} />
        <Row label="Property Taxes" value={calc.monthlyTax} />
        <Row label="Home Insurance" value={calc.monthlyIns} />
        {hoa > 0 && <Row label="HOA / Association" value={hoa} />}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-navy">
          <span>Total</span><span>{fmt(calc.total)}</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="mt-6 space-y-4">
        <Field label="Offer Price" value={offerPrice} onChange={setOfferPrice} prefix="$" />

        {/* Down payment presets */}
        <div>
          <label className="block text-xs font-semibold text-gray-600">Down Payment</label>
          <div className="mt-1 flex gap-1.5 flex-wrap">
            {DOWN_PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setDownPct(p)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  downPct === p ? "bg-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {p}%
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input type="number" value={downPct} min={0} max={100} step={1}
              onChange={(e) => setDownPct(Number(e.target.value) || 0)}
              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm text-right" />
            <span className="text-xs text-gray-500">% = {fmt(calc.downAmount)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">Loan amount: {fmt(calc.loanAmount)}</p>
        </div>

        {/* Interest rate */}
        <div>
          <label className="block text-xs font-semibold text-gray-600">Interest Rate (%)</label>
          <input type="number" value={rate} min={0} max={20} step={0.125}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
            className="mt-1 w-24 rounded border border-gray-300 px-2 py-1 text-sm text-right" />
        </div>

        {/* Loan term */}
        <div>
          <label className="block text-xs font-semibold text-gray-600">Loan Term</label>
          <div className="mt-1 flex gap-2">
            {TERM_OPTIONS.map((t) => (
              <button key={t.years} type="button" onClick={() => setTermYears(t.years)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  termYears === t.years ? "bg-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Field label="Annual Property Taxes" value={taxes} onChange={setTaxes} prefix="$" />
        <Field label="Annual Home Insurance" value={insurance} onChange={setInsurance} prefix="$" />
        <Field label="Monthly HOA / Association" value={hoa} onChange={setHoa} prefix="$" />
      </div>

      <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">
        This calculator provides estimates for informational purposes only. Actual rates, taxes,
        and insurance may vary. Consult a mortgage lender for accurate quotes.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span><span className="font-medium">{fmt(value)}</span>
    </div>
  );
}

function Field({ label, value, onChange, prefix }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600">{label}</label>
      <div className="mt-1 flex items-center gap-1">
        {prefix && <span className="text-sm text-gray-400">{prefix}</span>}
        <input type="number" value={value} min={0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-right" />
      </div>
    </div>
  );
}
