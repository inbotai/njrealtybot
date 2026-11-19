import type { TaxRatePair as TaxRatePairCopy } from "@/lib/tax-rate-labels";

/** Town-wide effective rate beside this home's own rate, with the two labels kept apart. */
export default function TaxRatePair({ pair }: { pair: TaxRatePairCopy }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{pair.townLabel}</p>
        <p className="mt-1 text-sm font-semibold text-navy">{pair.townValue}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{pair.propertyLabel}</p>
        <p className="mt-1 text-sm font-semibold text-navy">{pair.propertyValue}</p>
      </div>
      <p className="text-xs leading-relaxed text-gray-500 sm:col-span-2">{pair.note}</p>
    </div>
  );
}
