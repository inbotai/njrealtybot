/**
 * Square footage and price-per-square-foot that are safe to show.
 * Zero, null, blank, and non-numeric values are missing measurements.
 */

export function positiveAmount(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function sqftLabel(
  value: unknown,
  opts?: { minExclusive?: number; unit?: string },
): string | null {
  const n = positiveAmount(value);
  const minExclusive = opts?.minExclusive ?? 0;
  if (n == null || n <= minExclusive) return null;
  const rounded = Math.round(n);
  if (rounded <= 0) return null;
  const unit = opts?.unit ?? "sqft";
  return `${rounded.toLocaleString("en-US")} ${unit}`;
}

/** Null when the amount is missing or rounds to $0. */
export function pricePerSqftLabel(value: unknown): string | null {
  const n = positiveAmount(value);
  if (n == null || Math.round(n) <= 0) return null;
  return `$${Math.round(n).toLocaleString("en-US")}/sqft`;
}
