"use client";

/* ------------------------------------------------------------------ */
/*  Seller Listing Dashboard — visual progress tracker + offer review */
/* ------------------------------------------------------------------ */

const STEPS = [
  { label: "Valuation complete", status: "done" },
  { label: "Documents signed", status: "done" },
  { label: "Photos uploaded", status: "done" },
  { label: "Listed on MLS", status: "done" },
  { label: "3 showings this week", status: "active" },
  { label: "1 offer received — review now", status: "active" },
  { label: "Attorney review", status: "pending" },
  { label: "Inspection", status: "pending" },
  { label: "Closing", status: "pending" },
] as const;

type Status = (typeof STEPS)[number]["status"];

const ICON: Record<Status, string> = {
  done: "\u2705",
  active: "\uD83D\uDD04",
  pending: "\u2B1C",
};

/* ---- mock offer data ---- */
interface OfferRow {
  label: string;
  offer1: string;
  offer2: string;
  aiPick: string;
}

const OFFER_ROWS: OfferRow[] = [
  { label: "Price", offer1: "$510K", offer2: "$525K", aiPick: "#2" },
  { label: "Financing", offer1: "Conv 20%", offer2: "Cash", aiPick: "Cash = fast" },
  { label: "Contingency", offer1: "Inspect", offer2: "None", aiPick: "None = clean" },
  { label: "Close date", offer1: "45 days", offer2: "30 days", aiPick: "30 = fast" },
  { label: "Net to seller", offer1: "$478K", offer2: "$505K", aiPick: "#2 best net" },
  { label: "AI Score", offer1: "72 / 100", offer2: "94 / 100", aiPick: "" },
];

/* ================================================================== */

export default function SellerDashboard() {
  const completedCount = STEPS.filter((s) => s.status === "done").length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---- hero header ---- */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy">My Listing Dashboard</h1>
          <p className="mt-2 text-gray-500">
            Track every step of your home sale in real time.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
        {/* ---- overall progress bar ---- */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-sm font-medium text-gray-600">
            <span>Sale progress</span>
            <span className="text-navy font-bold">{pct}%</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* ---- step tracker ---- */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy">Timeline</h2>
          <ol className="relative mt-6 ml-4 border-l-2 border-gray-200">
            {STEPS.map((step, i) => {
              const dotColor =
                step.status === "done"
                  ? "bg-green-500"
                  : step.status === "active"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-gray-300";

              return (
                <li key={i} className="mb-6 ml-6 last:mb-0">
                  <span
                    className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${dotColor}`}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{ICON[step.status]}</span>
                    <span
                      className={`text-sm font-medium ${
                        step.status === "pending" ? "text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ---- offer comparison ---- */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy">Offer Comparison</h2>
          <p className="mt-1 text-sm text-gray-500">
            AI has analyzed both offers so you can decide with confidence.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-semibold text-gray-500" />
                  <th className="py-2 px-4 font-semibold text-gray-700">Offer #1</th>
                  <th className="py-2 px-4 font-semibold text-gray-700">Offer #2</th>
                  <th className="py-2 px-4 font-semibold text-gold">AI Pick</th>
                </tr>
              </thead>
              <tbody>
                {OFFER_ROWS.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-gray-600">{row.label}</td>
                    <td className="py-2.5 px-4 text-gray-800">{row.offer1}</td>
                    <td className="py-2.5 px-4 text-gray-800">{row.offer2}</td>
                    <td className="py-2.5 px-4 font-semibold text-indigo-600">{row.aiPick}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI recommendation callout */}
          <div className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-800">AI Recommendation</p>
            <p className="mt-1 text-sm text-indigo-700">
              Offer #2 scores <span className="font-bold">94/100</span> — cash, no contingencies,
              30-day close. Net to seller is <span className="font-bold">$27K higher</span> than
              Offer #1. Recommend accepting or countering at $535K.
            </p>
          </div>
        </div>

        {/* ---- action buttons ---- */}
        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-indigo-700 transition">
            View Counter Strategy
          </button>
          <button className="rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-green-700 transition">
            Accept Offer
          </button>
          <button className="rounded-lg border border-indigo-300 bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow hover:bg-indigo-50 transition">
            Request Agent Review
          </button>
        </div>

        {/* ---- coming-soon note ---- */}
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-100 p-5 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-600">Coming Soon</p>
          <p className="mt-1">
            Live showing feedback, counter-offer drafting, and closing-day checklists are on the way.
          </p>
        </div>
      </div>
    </div>
  );
}
