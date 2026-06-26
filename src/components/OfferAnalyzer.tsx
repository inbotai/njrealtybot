"use client";

import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";

/* ── types ─────────────────────────────────────────────── */

type FinancingType = "Cash" | "Conventional" | "FHA" | "VA";

interface Offer {
  id: number;
  buyerName: string;
  price: string;
  financing: FinancingType;
  downPaymentPct: string;
  contingencies: { inspection: boolean; appraisal: boolean; financing: boolean; saleOfHome: boolean };
  closingDate: string;
  hasEscalation: boolean;
  escalationMax: string;
  notes: string;
}

interface OfferScore {
  offerId: number;
  buyerLabel: string;
  score: number;
  netToSeller: number;
  risk: "Low" | "Medium" | "High";
  priceScore: number;
  financingScore: number;
  contingencyScore: number;
  timelineScore: number;
  isBest: boolean;
}

interface CounterStrategy {
  counterPrice: number;
  concessions: string;
  deadline: string;
  justification: string;
}

/* ── helpers ───────────────────────────────────────────── */

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const num = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;

const EMPTY_OFFER = (): Offer => ({
  id: Date.now(),
  buyerName: "",
  price: "",
  financing: "Conventional",
  downPaymentPct: "20",
  contingencies: { inspection: true, appraisal: true, financing: true, saleOfHome: false },
  closingDate: "",
  hasEscalation: false,
  escalationMax: "",
  notes: "",
});

const FINANCING_RISK: Record<FinancingType, number> = { Cash: 100, Conventional: 80, VA: 65, FHA: 60 };
const CLOSING_COST_PCT = 0.08; // ~8% NJ seller closing costs estimate

/* ── scoring engine (client-side, no API needed) ─────── */

function scoreOffers(askingPrice: number, offers: Offer[]): OfferScore[] {
  const parsed = offers.map((o) => {
    const price = num(o.price);
    const contCount = Object.values(o.contingencies).filter(Boolean).length;
    const today = new Date();
    const close = o.closingDate ? new Date(o.closingDate) : null;
    const daysToClose = close ? Math.max(1, Math.round((close.getTime() - today.getTime()) / 86400000)) : 45;

    // Price score: 100 if at or above asking, scales down
    const priceScore = Math.min(100, Math.round((price / askingPrice) * 100));

    // Financing score from lookup
    const financingScore = FINANCING_RISK[o.financing];

    // Contingency score: fewer = better
    const contingencyScore = Math.round(((4 - contCount) / 4) * 100);

    // Timeline score: 30-45 days ideal, penalize extremes
    let timelineScore = 100;
    if (daysToClose < 21) timelineScore = 70; // too fast = risky
    else if (daysToClose > 60) timelineScore = 60;
    else if (daysToClose > 45) timelineScore = 80;

    const score = Math.round(priceScore * 0.4 + financingScore * 0.2 + contingencyScore * 0.2 + timelineScore * 0.2);
    const netToSeller = Math.round(price * (1 - CLOSING_COST_PCT));

    // Risk assessment
    let risk: "Low" | "Medium" | "High" = "Low";
    if (o.financing === "FHA" || o.financing === "VA") risk = "Medium";
    if (contCount >= 3) risk = "Medium";
    if (o.contingencies.saleOfHome) risk = "High";
    if (o.financing === "FHA" && contCount >= 3) risk = "High";

    return {
      offerId: o.id,
      buyerLabel: o.buyerName || `Offer #${offers.indexOf(o) + 1}`,
      score,
      netToSeller,
      risk,
      priceScore,
      financingScore,
      contingencyScore,
      timelineScore,
      isBest: false,
    };
  });

  // Mark best
  const best = parsed.reduce((a, b) => (b.score > a.score ? b : a), parsed[0]);
  if (best) best.isBest = true;

  return parsed.sort((a, b) => b.score - a.score);
}

function generateCounter(askingPrice: number, bestOffer: Offer, bestScore: OfferScore): CounterStrategy {
  const offerPrice = num(bestOffer.price);
  const gap = askingPrice - offerPrice;
  const counterPrice = gap > 0 ? Math.round(offerPrice + gap * 0.6) : offerPrice;

  const concessions: string[] = [];
  if (gap > 10000) concessions.push(`Offer ${fmt(Math.min(5000, Math.round(gap * 0.15)))} closing cost credit instead of reducing price`);
  if (bestOffer.contingencies.saleOfHome) concessions.push("Request removal of sale-of-home contingency or add a kick-out clause");
  if (bestOffer.contingencies.inspection) concessions.push("Limit inspection contingency to 7 days with a cap on repair credits");
  if (bestOffer.financing !== "Cash") concessions.push("Request pre-approval letter from a local NJ lender");
  if (!concessions.length) concessions.push("Strong offer as-is. Consider accepting with minor timeline adjustment.");

  const today = new Date();
  const deadline = new Date(today.getTime() + 3 * 86400000);
  const deadlineStr = deadline.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const justParts: string[] = [];
  if (gap > 0) justParts.push(`The offer is ${fmt(gap)} below asking.`);
  if (bestScore.financingScore < 80) justParts.push(`${bestOffer.financing} financing carries higher fall-through risk.`);
  if (bestScore.contingencyScore < 75) justParts.push("Multiple contingencies add seller risk.");
  if (bestOffer.hasEscalation && num(bestOffer.escalationMax) > offerPrice) {
    justParts.push(`Buyer has escalation clause up to ${fmt(num(bestOffer.escalationMax))} — room to negotiate.`);
  }
  if (!justParts.length) justParts.push("This is a competitive offer. Counter to lock in favorable terms.");

  return { counterPrice, concessions: concessions.join(" | "), deadline: deadlineStr, justification: justParts.join(" ") };
}

/* ── component ─────────────────────────────────────────── */

const riskColor = { Low: "text-green-400", Medium: "text-yellow-400", High: "text-red-400" };
const riskBg = { Low: "bg-green-900/30 border-green-700", Medium: "bg-yellow-900/30 border-yellow-700", High: "bg-red-900/30 border-red-700" };

const INPUT = "w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const SELECT = INPUT + " appearance-none";
const LABEL = "block text-sm font-medium text-gray-300 mb-1";

export default function OfferAnalyzer() {
  const [address, setAddress] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [offers, setOffers] = useState<Offer[]>([EMPTY_OFFER()]);
  const [scores, setScores] = useState<OfferScore[] | null>(null);
  const [counter, setCounter] = useState<CounterStrategy | null>(null);
  const [sentToAgent, setSentToAgent] = useState(false);

  const updateOffer = (idx: number, patch: Partial<Offer>) =>
    setOffers((prev) => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));

  const toggleContingency = (idx: number, key: keyof Offer["contingencies"]) =>
    setOffers((prev) =>
      prev.map((o, i) =>
        i === idx ? { ...o, contingencies: { ...o.contingencies, [key]: !o.contingencies[key] } } : o
      )
    );

  const addOffer = () => {
    if (offers.length < 5) setOffers((p) => [...p, EMPTY_OFFER()]);
  };

  const removeOffer = (idx: number) => {
    if (offers.length > 1) setOffers((p) => p.filter((_, i) => i !== idx));
  };

  const analyze = () => {
    const ap = num(askingPrice);
    const valid = offers.filter((o) => num(o.price) > 0);
    if (ap <= 0 || valid.length === 0) return;

    const s = scoreOffers(ap, valid);
    setScores(s);

    const bestScore = s.find((x) => x.isBest);
    const bestOffer = valid.find((o) => o.id === bestScore?.offerId);
    if (bestScore && bestOffer) {
      setCounter(generateCounter(ap, bestOffer, bestScore));
    }
    setSentToAgent(false);
  };

  return (
    <RequireAuth>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            AI Offer{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              Analysis
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Compare up to 5 offers side-by-side. Get AI-scored rankings and a counter-strategy in seconds.
          </p>
        </div>
      </section>

      <div className="bg-navy min-h-screen pb-20">
        <div className="mx-auto max-w-4xl px-4">

          {/* Section 1: Property */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
            <h2 className="text-xl font-bold text-gold mb-4">Your Property</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL}>Address</label>
                <input className={INPUT} placeholder="123 Main St, Newark, NJ" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Asking Price</label>
                <input className={INPUT} placeholder="$450,000" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 2: Offers */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gold">Offers Received</h2>
              {offers.length < 5 && (
                <button onClick={addOffer} className="rounded-lg bg-gold/20 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/30 transition">
                  + Add Offer
                </button>
              )}
            </div>

            {offers.map((offer, idx) => (
              <div key={offer.id} className="rounded-xl border border-white/10 bg-white/5 p-5 mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Offer #{idx + 1}</h3>
                  {offers.length > 1 && (
                    <button onClick={() => removeOffer(idx)} className="text-sm text-red-400 hover:text-red-300">Remove</button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className={LABEL}>Buyer Name (optional)</label>
                    <input className={INPUT} placeholder="John Doe" value={offer.buyerName} onChange={(e) => updateOffer(idx, { buyerName: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL}>Offer Price *</label>
                    <input className={INPUT} placeholder="$440,000" value={offer.price} onChange={(e) => updateOffer(idx, { price: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL}>Financing Type</label>
                    <select className={SELECT} value={offer.financing} onChange={(e) => updateOffer(idx, { financing: e.target.value as FinancingType })}>
                      <option value="Cash">Cash</option>
                      <option value="Conventional">Conventional</option>
                      <option value="FHA">FHA</option>
                      <option value="VA">VA</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Down Payment %</label>
                    <input className={INPUT} type="number" min="0" max="100" value={offer.downPaymentPct} onChange={(e) => updateOffer(idx, { downPaymentPct: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL}>Proposed Closing Date</label>
                    <input className={INPUT} type="date" value={offer.closingDate} onChange={(e) => updateOffer(idx, { closingDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL}>Escalation Clause</label>
                    <div className="flex items-center gap-3">
                      <select className={SELECT + " w-20"} value={offer.hasEscalation ? "yes" : "no"} onChange={(e) => updateOffer(idx, { hasEscalation: e.target.value === "yes" })}>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                      {offer.hasEscalation && (
                        <input className={INPUT + " flex-1"} placeholder="Max $" value={offer.escalationMax} onChange={(e) => updateOffer(idx, { escalationMax: e.target.value })} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Contingencies */}
                <div className="mt-3">
                  <label className={LABEL}>Contingencies</label>
                  <div className="flex flex-wrap gap-3">
                    {(["inspection", "appraisal", "financing", "saleOfHome"] as const).map((key) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={offer.contingencies[key]} onChange={() => toggleContingency(idx, key)} className="accent-gold h-4 w-4" />
                        {key === "saleOfHome" ? "Sale of Home" : key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-3">
                  <label className={LABEL}>Notes</label>
                  <input className={INPUT} placeholder="Personal letter, flexible on closing, etc." value={offer.notes} onChange={(e) => updateOffer(idx, { notes: e.target.value })} />
                </div>
              </div>
            ))}
          </div>

          {/* Analyze button */}
          <button
            onClick={analyze}
            disabled={num(askingPrice) <= 0 || offers.every((o) => num(o.price) <= 0)}
            className="w-full rounded-xl bg-gradient-to-r from-gold to-yellow-500 py-4 text-lg font-bold text-navy hover:shadow-lg hover:shadow-gold/20 transition disabled:opacity-40 disabled:cursor-not-allowed mb-8"
          >
            Analyze Offers
          </button>

          {/* Section 3: AI Analysis */}
          {scores && scores.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
              <h2 className="text-xl font-bold text-gold mb-4">AI Offer Rankings</h2>
              <div className="space-y-4">
                {scores.map((s) => (
                  <div key={s.offerId} className={`rounded-xl border p-5 ${s.isBest ? "border-gold bg-gold/10" : "border-white/10 bg-white/5"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white text-lg">{s.buyerLabel}</h3>
                        {s.isBest && (
                          <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">AI RECOMMENDED</span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-extrabold text-gold">{s.score}</div>
                        <div className="text-xs text-gray-400">/ 100</div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4 text-sm">
                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="text-gray-400 text-xs mb-1">Price Score</div>
                        <div className="text-white font-semibold">{s.priceScore}/100</div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-gold" style={{ width: `${s.priceScore}%` }} /></div>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="text-gray-400 text-xs mb-1">Financing</div>
                        <div className="text-white font-semibold">{s.financingScore}/100</div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-400" style={{ width: `${s.financingScore}%` }} /></div>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="text-gray-400 text-xs mb-1">Contingencies</div>
                        <div className="text-white font-semibold">{s.contingencyScore}/100</div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-green-400" style={{ width: `${s.contingencyScore}%` }} /></div>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="text-gray-400 text-xs mb-1">Timeline</div>
                        <div className="text-white font-semibold">{s.timelineScore}/100</div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-purple-400" style={{ width: `${s.timelineScore}%` }} /></div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="text-gray-300">
                        Est. Net to Seller: <span className="font-bold text-white">{fmt(s.netToSeller)}</span>
                      </div>
                      <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBg[s.risk]} ${riskColor[s.risk]}`}>
                        {s.risk} Risk
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Counter-Strategy */}
          {counter && scores && (
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 mb-6">
              <h2 className="text-xl font-bold text-gold mb-4">AI Counter-Strategy</h2>
              <p className="text-sm text-gray-400 mb-4">For the top-ranked offer:</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-xs text-gray-400 mb-1">Recommended Counter Price</div>
                  <div className="text-2xl font-extrabold text-gold">{fmt(counter.counterPrice)}</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-xs text-gray-400 mb-1">Response Deadline</div>
                  <div className="text-lg font-bold text-white">{counter.deadline}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-gray-400 mb-2">Suggested Concessions</div>
                <div className="space-y-2">
                  {counter.concessions.split(" | ").map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-200">
                      <span className="text-gold mt-0.5">&#x2022;</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-gray-400 mb-1">Justification</div>
                <p className="text-sm text-gray-200">{counter.justification}</p>
              </div>

              {/* Send to Agent */}
              <div className="mt-6">
                {!sentToAgent ? (
                  <button
                    onClick={() => setSentToAgent(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-gold to-yellow-500 py-3 text-lg font-bold text-navy hover:shadow-lg hover:shadow-gold/20 transition"
                  >
                    Send to Agent for Review
                  </button>
                ) : (
                  <div className="rounded-xl border border-green-700 bg-green-900/30 p-4 text-center">
                    <div className="text-green-400 font-bold text-lg mb-1">Sent for Review</div>
                    <p className="text-sm text-gray-300">
                      A licensed NJ real estate agent will review your offer analysis and counter-strategy.
                      You will be contacted within 24 hours.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              AI-generated strategies are recommendations only. All negotiations are reviewed and approved
              by a licensed NJ real estate agent before any communication is sent. Garden State AI does not
              provide legal advice and is not a party to any transaction.
            </p>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
