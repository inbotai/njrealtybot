import type { Metadata } from "next";
import Link from "next/link";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

export const metadata: Metadata = {
  title: "NJ Development News | Planning & Zoning Updates",
  description:
    "Stay informed about new developments in your NJ neighborhood. Planning board approvals, zoning variances, site plans — sourced from official municipal documents.",
  keywords: [
    "NJ development news", "planning board NJ", "zoning board NJ",
    "new construction NJ", "site plan approval NJ", "development alerts NJ",
  ],
};

interface MuniItem {
  id: string;
  municipality: string;
  county: string;
  item_type: string;
  status: string;
  property_address: string | null;
  applicant: string | null;
  unit_count: number | null;
  description: string;
  hearing_date: string | null;
  application_number: string | null;
  created_at: string;
}

async function fetchNews(): Promise<MuniItem[]> {
  try {
    const res = await fetch(`${IDX_API}/api/idx/municipal-news?limit=30`, {
      next: { revalidate: 1800 }, // 30 min ISR
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch { return []; }
}

const TYPE_LABELS: Record<string, string> = {
  site_plan: "Site Plan",
  use_variance: "Use Variance",
  bulk_variance: "Bulk Variance",
  subdivision: "Subdivision",
  redevelopment_plan: "Redevelopment",
  ordinance: "Ordinance",
  conditional_use: "Conditional Use",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  carried: "bg-yellow-100 text-yellow-800",
  pending: "bg-blue-100 text-blue-800",
  withdrawn: "bg-gray-100 text-gray-600",
};

export default async function NewsPage() {
  const items = await fetchNews();

  // Group by municipality
  const byMuni: Record<string, MuniItem[]> = {};
  for (const item of items) {
    const muni = item.municipality.replace(/\s*(TWP|BORO|CITY|TOWN|VILLAGE)\s*$/i, "").trim();
    if (!byMuni[muni]) byMuni[muni] = [];
    byMuni[muni].push(item);
  }

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold md:text-5xl">
            NJ Development{" "}
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              News
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Planning board approvals, zoning variances, and new construction — sourced from official municipal documents.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          {items.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-700">No development news yet</p>
              <p className="mt-2 text-sm text-gray-500">We&apos;re monitoring 18 NJ municipalities. News articles will appear here as documents are processed.</p>
              <Link href="/my-home" className="mt-4 inline-block rounded-lg bg-gold px-6 py-2 font-bold text-navy hover:bg-yellow-400">
                Track My Home — Get Development Alerts
              </Link>
            </div>
          ) : (
            <>
              {Object.entries(byMuni).map(([muni, muniItems]) => (
                <div key={muni} className="mb-10">
                  <h2 className="text-xl font-bold text-navy border-b pb-2 mb-4">{muni}</h2>
                  <div className="space-y-4">
                    {muniItems.map(item => (
                      <div key={item.id} className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                                {TYPE_LABELS[item.item_type] || item.item_type}
                              </span>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-600"}`}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </span>
                              {item.application_number && (
                                <span className="text-xs text-gray-400">{item.application_number}</span>
                              )}
                            </div>
                            {item.property_address && (
                              <p className="mt-2 text-sm font-semibold text-gray-900">{item.property_address}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                            <div className="mt-2 flex gap-4 text-xs text-gray-400">
                              {item.applicant && <span>Applicant: {item.applicant}</span>}
                              {item.unit_count && <span>{item.unit_count} units</span>}
                              {item.hearing_date && <span>Hearing: {item.hearing_date}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-8 rounded-xl bg-gradient-to-r from-navy to-indigo-900 p-6 text-center text-white">
                <h3 className="font-bold">Want Development Alerts for Your Neighborhood?</h3>
                <p className="mt-1 text-sm text-gray-300">Get notified when new projects are proposed near your home.</p>
                <Link href="/my-home" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2 font-bold text-navy hover:bg-yellow-400">
                  Track My Home — Free
                </Link>
              </div>
            </>
          )}

          <p className="mt-6 text-center text-[10px] text-gray-400">
            This information is sourced from official NJ municipal board documents. It is not legal advice.
            Garden State AI does not offer guarantees and does not represent any party in these proceedings.
          </p>
        </div>
      </section>
    </>
  );
}
