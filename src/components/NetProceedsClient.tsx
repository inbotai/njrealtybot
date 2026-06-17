"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/service-ladder/property-tax/calc";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

const DISCLAIMER =
  "This analysis is a general estimate based on public data. " +
  "It is not legal, tax, or financial advice. Actual costs may vary. " +
  "Consult your attorney and financial advisor for exact figures. " +
  "Garden State AI does not offer guarantees and does not represent the taxpayer.";

interface NetResult {
  grossPrice: number;
  costs: { commission: number; commissionPct: number; realtyTransferFee: number; attorneyFee: number; titleAndRecording: number; repairsAndConcessions: number; totalCosts: number };
  mortgagePayoff: number;
  netToSeller: number;
  mansionTaxNote: string | null;
}

interface SellVsRentResult {
  sell: { netProceeds: number; annualReturnOnProceeds: number; returnRate: number };
  rent: { grossAnnualRent: number; expenses: { taxes: number; insurance: number; maintenance: number; vacancy: number; management: number; totalExpenses: number }; netAnnualCashFlow: number; capRate: number };
  recommendation: string;
}

export default function NetProceedsClient() {
  const [salePrice, setSalePrice] = useState("");
  const [mortgage, setMortgage] = useState("");
  const [commission, setCommission] = useState("5");
  const [repairs, setRepairs] = useState("0");
  const [isSenior, setIsSenior] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [annualTaxes, setAnnualTaxes] = useState("");
  const [mgmtPct, setMgmtPct] = useState("0");
  const [loading, setLoading] = useState(false);
  const [netResult, setNetResult] = useState<NetResult | null>(null);
  const [svrResult, setSvrResult] = useState<SellVsRentResult | null>(null);
  const [showLead, setShowLead] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadDone, setLeadDone] = useState(false);

  function parseNum(s: string): number { return Number(s.replace(/[^0-9.]/g, "")) || 0; }

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    const sp = parseNum(salePrice);
    if (sp <= 0) return;
    setLoading(true);

    const [npRes, svrRes] = await Promise.all([
      fetch(`${IDX_API}/api/idx/net-proceeds`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salePrice: sp, mortgageBalance: parseNum(mortgage) || undefined, commissionPct: parseFloat(commission), isSeniorOrDisabled: isSenior, repairsAndConcessions: parseNum(repairs) || undefined }),
      }).then(r => r.ok ? r.json() : null).catch(() => null),
      (parseNum(monthlyRent) > 0 && parseNum(annualTaxes) > 0)
        ? fetch(`${IDX_API}/api/idx/sell-vs-rent`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ salePrice: sp, mortgageBalance: parseNum(mortgage) || undefined, commissionPct: parseFloat(commission), isSeniorOrDisabled: isSenior, monthlyRentEstimate: parseNum(monthlyRent), annualTaxes: parseNum(annualTaxes), managementRate: parseFloat(mgmtPct) }),
          }).then(r => r.ok ? r.json() : null).catch(() => null)
        : Promise.resolve(null),
    ]);

    setNetResult(npRes);
    setSvrResult(svrRes);
    setLoading(false);
  }

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            What Will You{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">Walk Away With</span>?
          </h1>
          <p className="mt-4 text-lg text-gray-300">NJ net proceeds calculator with real Realty Transfer Fee brackets + sell vs rent comparison.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-2xl px-4">
          <form onSubmit={calculate} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Expected Sale Price</label>
                <input type="text" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="$500,000" required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mortgage Balance</label>
                <input type="text" value={mortgage} onChange={e => setMortgage(e.target.value)} placeholder="$300,000"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Commission %</label>
                <input type="number" value={commission} onChange={e => setCommission(e.target.value)} step="0.5" min="0" max="10"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Repairs/Concessions</label>
                <input type="text" value={repairs} onChange={e => setRepairs(e.target.value)} placeholder="$0"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 py-3 text-sm text-gray-700">
                  <input type="checkbox" checked={isSenior} onChange={e => setIsSenior(e.target.checked)} className="rounded border-gray-300" />
                  Senior/Disabled (62+)
                </label>
              </div>
            </div>

            {/* Sell vs Rent section */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700">Compare with renting (optional)</p>
              <p className="text-xs text-gray-400">Fill in to see a sell vs rent comparison</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs text-gray-500">Est. Monthly Rent</label>
                  <input type="text" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} placeholder="$2,500"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Annual Property Taxes</label>
                  <input type="text" value={annualTaxes} onChange={e => setAnnualTaxes(e.target.value)} placeholder="$8,000"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Management Fee %</label>
                  <input type="number" value={mgmtPct} onChange={e => setMgmtPct(e.target.value)} step="1" min="0" max="15"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || !salePrice.trim()}
              className="w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-50">
              {loading ? "Calculating..." : "Calculate My Net Proceeds"}
            </button>
          </form>

          {/* Net Proceeds Result */}
          {netResult && (
            <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Net Proceeds Breakdown</h2>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
                  <dt className="text-gray-600">Sale Price</dt>
                  <dd className="font-medium">{formatCurrency(netResult.grossPrice)}</dd>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs font-semibold uppercase text-gray-500 px-3">Closing Costs</p>
                </div>
                <div className="flex justify-between px-3 py-1">
                  <dt className="text-gray-600">Commission ({netResult.costs.commissionPct}%)</dt>
                  <dd className="font-medium text-red-600">-{formatCurrency(netResult.costs.commission)}</dd>
                </div>
                <div className="flex justify-between px-3 py-1">
                  <dt className="text-gray-600">NJ Realty Transfer Fee</dt>
                  <dd className="font-medium text-red-600">-{formatCurrency(netResult.costs.realtyTransferFee)}</dd>
                </div>
                <div className="flex justify-between px-3 py-1">
                  <dt className="text-gray-600">Attorney</dt>
                  <dd className="font-medium text-red-600">-{formatCurrency(netResult.costs.attorneyFee)}</dd>
                </div>
                <div className="flex justify-between px-3 py-1">
                  <dt className="text-gray-600">Title & Recording</dt>
                  <dd className="font-medium text-red-600">-{formatCurrency(netResult.costs.titleAndRecording)}</dd>
                </div>
                {netResult.costs.repairsAndConcessions > 0 && (
                  <div className="flex justify-between px-3 py-1">
                    <dt className="text-gray-600">Repairs/Concessions</dt>
                    <dd className="font-medium text-red-600">-{formatCurrency(netResult.costs.repairsAndConcessions)}</dd>
                  </div>
                )}
                <div className="flex justify-between rounded bg-red-50 px-3 py-2 font-semibold">
                  <dt className="text-red-800">Total Costs</dt>
                  <dd className="text-red-800">-{formatCurrency(netResult.costs.totalCosts)}</dd>
                </div>
                {netResult.mortgagePayoff > 0 && (
                  <div className="flex justify-between px-3 py-2">
                    <dt className="text-gray-600">Mortgage Payoff</dt>
                    <dd className="font-medium text-red-600">-{formatCurrency(netResult.mortgagePayoff)}</dd>
                  </div>
                )}
                <div className={`flex justify-between rounded px-3 py-3 text-lg font-bold ${netResult.netToSeller >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                  <dt className={netResult.netToSeller >= 0 ? "text-green-800" : "text-red-800"}>
                    {netResult.netToSeller >= 0 ? "Net to Seller" : "Amount Due at Closing"}
                  </dt>
                  <dd className={netResult.netToSeller >= 0 ? "text-green-800" : "text-red-800"}>{formatCurrency(Math.abs(netResult.netToSeller))}</dd>
                </div>
                {netResult.netToSeller < 0 && (
                  <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    Selling at this price would require bringing approximately {formatCurrency(Math.abs(netResult.netToSeller))} to closing.
                    The mortgage balance exceeds the net sale proceeds. Consider adjusting the sale price or exploring rental options.
                  </p>
                )}
              </dl>
              {netResult.mansionTaxNote && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded p-2">{netResult.mansionTaxNote}</p>
              )}

              {/* Lead gate for PDF */}
              {!leadDone && !showLead && (
                <button onClick={() => setShowLead(true)}
                  className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Download PDF Report
                </button>
              )}
              {showLead && !leadDone && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await fetch(`${IDX_API}/api/idx/leads`, {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ full_name: leadName, phone: leadPhone, message: `Net proceeds lead — sale $${netResult.grossPrice.toLocaleString()}, net $${netResult.netToSeller.toLocaleString()}`, lead_type: "info_request" }),
                    });
                  } catch { /* still unlock */ }
                  setLeadDone(true);
                }} className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <input type="text" value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="Name" required
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                    <input type="tel" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} placeholder="Phone" required
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                    <button type="submit" className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-navy hover:bg-yellow-400">Unlock</button>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" />
                    <span className="text-[10px] text-gray-500 leading-relaxed">
                      I consent to receive SMS/WhatsApp messages from Garden State AI.
                      Msg &amp; data rates may apply. Reply STOP to opt out.{" "}
                      <a href="/privacy" target="_blank" className="underline hover:text-gray-700">Privacy</a>
                      {" & "}
                      <a href="/terms" target="_blank" className="underline hover:text-gray-700">Terms</a>.
                    </span>
                  </label>
                </form>
              )}
            </div>
          )}

          {/* Sell vs Rent Comparison */}
          {svrResult && (
            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Sell vs Rent Comparison</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <h3 className="font-semibold text-green-800">If You Sell</h3>
                  <p className="mt-2 text-2xl font-bold text-green-700">{formatCurrency(svrResult.sell.netProceeds)}</p>
                  <p className="text-xs text-green-600">net proceeds (lump sum)</p>
                  <p className="mt-2 text-sm text-green-700">Invested at {svrResult.sell.returnRate}%: <strong>{formatCurrency(svrResult.sell.annualReturnOnProceeds)}/yr</strong></p>
                </div>
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-800">If You Rent</h3>
                  <p className="mt-2 text-2xl font-bold text-blue-700">{formatCurrency(svrResult.rent.netAnnualCashFlow)}<span className="text-sm font-normal">/yr</span></p>
                  <p className="text-xs text-blue-600">net cash flow ({svrResult.rent.capRate}% cap rate)</p>
                  <div className="mt-2 text-xs text-blue-700 space-y-0.5">
                    <p>Gross rent: {formatCurrency(svrResult.rent.grossAnnualRent)}/yr</p>
                    <p>Expenses: -{formatCurrency(svrResult.rent.expenses.totalExpenses)}/yr</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{svrResult.recommendation}</p>
            </div>
          )}

          {(netResult || svrResult) && (
            <div className="mt-4 border-t pt-3">
              <p className="text-[10px] font-semibold text-gray-400">Disclaimer</p>
              <p className="mt-0.5 text-[10px] text-gray-400 leading-relaxed">{DISCLAIMER}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
