/**
 * Display helpers for Chapter 123 tax tools.
 *
 * The IDX API mixes units: equalization ratios arrive as a decimal
 * (eqRatioEffective = 0.6356) or as percentage points (eqRatio = 63.56,
 * commonLevelRangeLow = 54.03). Anything above 2 is already in percentage
 * points — NJ director ratios as decimals stay under about 1.5.
 */

export function toPercentPoints(n: number): number | null {
  if (!Number.isFinite(n)) return null;
  return Math.abs(n) > 2 ? n : n * 100;
}

export function formatRatio(n: number): string {
  const pct = toPercentPoints(n);
  if (pct == null) return "—";
  return `${pct.toFixed(2)}%`;
}

export function compsSupportMessage(input: {
  city?: string;
  assessedValue: number;
  comparables: Array<{ salePrice?: number | null }>;
}): string {
  const place = input.city ? ` in ${input.city}` : "";
  const prices = (input.comparables || [])
    .map((c) => Number(c.salePrice) || 0)
    .filter((n) => n > 0);
  if (!prices.length || !(input.assessedValue > 0)) {
    return `Recent sales${place} are listed below.`;
  }
  const above = prices.filter((p) => p > input.assessedValue).length;
  const below = prices.filter((p) => p < input.assessedValue).length;
  if (above > 0 && below === 0) {
    return `These recent sales${place} are above your assessment. They do not support a lower assessment.`;
  }
  if (below > 0 && above === 0) {
    return `These comparable sales${place} are below your assessment and support a lower assessment.`;
  }
  if (below > above) {
    return `${below} of these sales${place} are below your assessment and ${above} are above. The lower sales are what an appeal would rely on.`;
  }
  return `${above} of these sales${place} are above your assessment and ${below} are below. Together they do not support a lower assessment.`;
}

/** Short headline that follows the ratios, not a fixed phrase per case label. */
export function assessmentHeadline(input: {
  propertyRatio: number;
  equalization: number;
  rangeLow?: number | null;
  rangeHigh?: number | null;
}): string {
  const p = toPercentPoints(input.propertyRatio);
  const e = toPercentPoints(input.equalization);
  const lo = input.rangeLow == null ? null : toPercentPoints(input.rangeLow);
  const hi = input.rangeHigh == null ? null : toPercentPoints(input.rangeHigh);
  if (p == null) return "Assessment compared with recent sales";
  if (hi != null && p > hi) return "Your assessment is above the common level range";
  if (lo != null && p < lo) return "Your assessment is below the common level range";
  if (e != null && Math.abs(p - e) <= 3) return "Your assessment is close to the county equalization ratio";
  if (e != null && p > e) return "Your assessment is inside the range, above the county ratio";
  return "Your assessment is inside the common level range";
}

/**
 * The analysis API sometimes says the property ratio is "near the upper limit"
 * even when it sits next to the county ratio and well below the range ceiling.
 * Keep the rest of the sentence and correct that clause from the numbers.
 */
export function reconcileExplanation(
  raw: string,
  input: { propertyRatio: number; equalization: number; rangeHigh?: number | null },
): string {
  if (!raw || !/upper limit/i.test(raw)) return raw;
  const p = toPercentPoints(input.propertyRatio);
  const e = toPercentPoints(input.equalization);
  const hi = input.rangeHigh == null ? null : toPercentPoints(input.rangeHigh);
  if (p == null || hi == null || hi - p <= 5) return raw;
  const phrase = e != null && Math.abs(p - e) <= 3
    ? "and close to the county equalization ratio"
    : "and inside the common level range";
  return raw.replace(/but near the upper limit/i, phrase);
}

export function ratioRelationshipCopy(input: {
  propertyRatio: number;
  equalization: number;
  rangeLow?: number | null;
  rangeHigh?: number | null;
}): string {
  const p = toPercentPoints(input.propertyRatio);
  const e = toPercentPoints(input.equalization);
  const lo = input.rangeLow == null ? null : toPercentPoints(input.rangeLow);
  const hi = input.rangeHigh == null ? null : toPercentPoints(input.rangeHigh);
  if (p == null || e == null) return "";
  const fmt = (n: number) => `${n.toFixed(2)}%`;
  const why =
    `Your property ratio (${fmt(p)}) is this home's assessment divided by the comp-based market value. ` +
    `The equalization ratio (${fmt(e)}) is the county-wide Director's Ratio used for Chapter 123. ` +
    `They measure different things, so they are not supposed to match.`;
  if (lo != null && hi != null) {
    if (p > hi) return `${why} This home sits above the common level range (${fmt(lo)}–${fmt(hi)}).`;
    if (p < lo) return `${why} This home sits below the common level range (${fmt(lo)}–${fmt(hi)}).`;
    return `${why} This home is inside the common level range (${fmt(lo)}–${fmt(hi)}).`;
  }
  return why;
}

/**
 * NJ appeals are filed by April 1 of the tax year. Before that date (including
 * April 1) the open tax year is the calendar year. After it, the next April 1
 * belongs to the following tax year.
 */
export function nextAppealTaxYear(now = new Date()): number {
  const year = now.getFullYear();
  const april1 = new Date(year, 3, 1);
  const today = new Date(year, now.getMonth(), now.getDate());
  return today.getTime() <= april1.getTime() ? year : year + 1;
}

/** Prefer the API tax year. Fall back to the tax year whose April 1 deadline is next. */
export function appealTaxYear(
  data?: { taxYear?: unknown; ratioTaxYear?: unknown } | null,
  now = new Date(),
): number {
  for (const raw of [data?.taxYear, data?.ratioTaxYear]) {
    const n = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
    if (Number.isInteger(n) && n >= 1990 && n <= 2100) return n;
  }
  return nextAppealTaxYear(now);
}

export function taxYearRatiosLabel(year: number): string {
  return `Tax year ${year} ratios`;
}
