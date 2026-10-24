import Link from "next/link";
import { townTaxPages } from "@/lib/nj-tax-rates";

export default function TownTaxDirectory() {
  const towns = townTaxPages();
  const byCounty = new Map<string, typeof towns>();
  for (const town of towns) {
    const list = byCounty.get(town.county) || [];
    list.push(town);
    byCounty.set(town.county, list);
  }
  const counties = [...byCounty.keys()].sort((a, b) => a.localeCompare(b));

  return (
    <section className="border-t bg-gray-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-bold text-navy">New Jersey property tax rates by town</h2>
        <p className="mt-2 text-sm text-gray-600">
          Official 2025 general tax rates for all {towns.length} municipalities. Open a town for the effective rate, a $500,000 and $750,000 example bill, and a tax-appeal check.
        </p>
        <div className="mt-6 space-y-3">
          {counties.map((county) => (
            <details key={county} className="rounded-lg border bg-white px-4 py-3">
              <summary className="cursor-pointer font-semibold text-navy">{county} County</summary>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {(byCounty.get(county) || [])
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((town) => (
                    <li key={town.slug}>
                      <Link href={`/property-tax/${town.slug}`} className="text-sm text-indigo-700 hover:underline">
                        {town.name} <span className="text-gray-400">{town.generalRate.toFixed(3)}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
