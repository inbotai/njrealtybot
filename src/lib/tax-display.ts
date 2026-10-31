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
  chapter123Applies?: boolean;
}): string {
  if (input.chapter123Applies === false) return "Chapter 123 does not apply this year";
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
  chapter123Applies?: boolean;
}): string {
  if (input.chapter123Applies === false) {
    return "Chapter 123 does not apply this year. Compare the assessment directly to market value.";
  }
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

/**
 * The attorney banner is for a suppressed multi-unit or Class 4 analysis, which
 * sends savingsSuppressed plus a property-type warning. A no-case home can also
 * set the flag with no warning; dollar savings stay hidden through case strength.
 */
export function isSavingsSuppressed(data?: { savingsSuppressed?: unknown; propertyTypeWarning?: unknown } | null): boolean {
  if (data?.savingsSuppressed !== true) return false;
  return typeof data.propertyTypeWarning === "string" && data.propertyTypeWarning.trim().length > 0;
}

/** Prefer the analyze API's error text, including a missing-unit prompt. */
export function taxAppealErrorMessage(
  body: { error?: unknown } | null | undefined,
  fallback: string,
): string {
  const message = typeof body?.error === "string" ? body.error.trim() : "";
  return message || fallback;
}

export interface Chapter123Display {
  applies: boolean;
  headline: string;
  showCommonLevelRange: boolean;
  rangeLabel: string | null;
  detail: string;
}

/**
 * Chapter 123 is the appeal test only when the API says it applies.
 * A revaluation or reassessment year sets chapter123Applies to false and still
 * returns the county range; that range must not be shown as the test.
 */
export function chapter123Display(data?: {
  chapter123Applies?: unknown;
  chapter123Explanation?: string | null;
  appealRiskWarning?: string | null;
  commonLevelRangeLow?: number | null;
  commonLevelRangeHigh?: number | null;
} | null): Chapter123Display {
  const detail = (data?.chapter123Explanation || data?.appealRiskWarning || "").trim();
  if (data?.chapter123Applies === false) {
    return {
      applies: false,
      headline: "Chapter 123 does not apply this year.",
      showCommonLevelRange: false,
      rangeLabel: null,
      detail,
    };
  }
  const lo = typeof data?.commonLevelRangeLow === "number" ? data.commonLevelRangeLow : NaN;
  const hi = typeof data?.commonLevelRangeHigh === "number" ? data.commonLevelRangeHigh : NaN;
  const showCommonLevelRange = Number.isFinite(lo) && Number.isFinite(hi) && lo > 0 && hi > lo;
  return {
    applies: true,
    headline: "Chapter 123 common level range",
    showCommonLevelRange,
    rangeLabel: showCommonLevelRange ? `${formatRatio(lo)} – ${formatRatio(hi)}` : null,
    detail,
  };
}

/** Attorney notice for a suppressed multi-unit / Class 4 analysis. Empty when the API did not send one. */
export function suppressedAppealWarning(data?: { propertyTypeWarning?: string | null; caseStrengthExplanation?: string | null } | null): string {
  return (data?.propertyTypeWarning || data?.caseStrengthExplanation || "").trim();
}

/**
 * What the tax screens and Vale follow-ups should show.
 * Savings and overpayment are shown only for a strong or moderate case with a
 * positive high estimate. A $0 high, a weak or no-case result, and a suppressed
 * multi-unit analysis do not show a dollar savings figure. Case strength stays
 * visible unless the API suppressed the analysis.
 */
export function describeTaxAppealResult(data?: {
  savingsSuppressed?: unknown;
  propertyTypeWarning?: string | null;
  caseStrengthExplanation?: string | null;
  address?: string | null;
  overpaymentHigh?: number | null;
  caseStrength?: string | null;
} | null): {
  suppressed: boolean;
  showSavings: boolean;
  showCaseStrength: boolean;
  warning: string;
  valeMessage: string;
} {
  const suppressed = isSavingsSuppressed(data);
  const warning = suppressedAppealWarning(data);
  const address = data?.address || "this property";
  if (suppressed) {
    const notice = warning || "This analysis does not estimate appeal savings. Consult a tax appeal attorney.";
    return {
      suppressed: true,
      showSavings: false,
      showCaseStrength: false,
      warning: notice,
      valeMessage: `Hi Vale! I checked the property taxes on ${address}. ${notice}`,
    };
  }
  const strength = data?.caseStrength;
  const high = Number(data?.overpaymentHigh);
  const showSavings = (strength === "strong" || strength === "moderate") && Number.isFinite(high) && high > 0;
  const valeMessage = showSavings
    ? `Hi Vale! I just found out I may be overpaying $${high.toLocaleString("en-US")}/year in property taxes on ${address}. Can you help me with the appeal process?`
    : `Hi Vale! I checked the property taxes on ${address}. The comparable sales do not support a lower assessment. Can you review it with me?`;
  return {
    suppressed: false,
    showSavings,
    showCaseStrength: true,
    warning,
    valeMessage,
  };
}

/** WhatsApp / SMS copy for the tax-shock "Get Your Tax Appeal Package" form. */
export function taxShockDeliveryCopy(data: {
  address?: string | null;
  assessedValue?: number | null;
  estimatedMarketValueMid?: number | null;
  taxAnnual?: number | null;
  caseStrength?: string | null;
  overpaymentLow?: number | null;
  overpaymentHigh?: number | null;
  comparables?: unknown[] | null;
  filingDeadline?: string | null;
  savingsSuppressed?: unknown;
  propertyTypeWarning?: string | null;
  caseStrengthExplanation?: string | null;
}): { message: string; resultsText: string } {
  const view = describeTaxAppealResult(data);
  const address = data.address || "this property";
  const dollars = (n?: number | null) => `$${Number(n || 0).toLocaleString("en-US")}`;
  if (view.suppressed) {
    return {
      message: `Tax Shock: ${address} — ${view.warning}`,
      resultsText: [
        `\u{1F4CA} *Tax Analysis \u2014 ${address}*\n`,
        `Assessment: ${dollars(data.assessedValue)}`,
        `Annual Taxes: ${dollars(data.taxAnnual)}`,
        view.warning,
        `Comparable Sales: ${data.comparables?.length || 0}`,
        `Filing Deadline: ${data.filingDeadline || "N/A"}\n`,
        `Full analysis: gardenstate.ai/tax-shock`,
        `\u2014 Garden State AI`,
      ].join("\n"),
    };
  }
  if (!view.showSavings) {
    return {
      message: `Tax Shock: ${address} — assessment reviewed`,
      resultsText: [
        `\u{1F4CA} *Tax Analysis \u2014 ${address}*\n`,
        `Assessment: ${dollars(data.assessedValue)}`,
        `Market Value: ${dollars(data.estimatedMarketValueMid)}`,
        `Annual Taxes: ${dollars(data.taxAnnual)}`,
        `Case Strength: ${data.caseStrength || "n/a"}`,
        `Comparable Sales: ${data.comparables?.length || 0}`,
        `Filing Deadline: ${data.filingDeadline || "N/A"}\n`,
        `Full analysis: gardenstate.ai/tax-shock`,
        `\u2014 Garden State AI`,
      ].join("\n"),
    };
  }
  return {
    message: `Tax Shock: ${address} — overpaying ~${dollars(data.overpaymentHigh)}/yr`,
    resultsText: [
      `\u{1F4CA} *Tax Analysis \u2014 ${address}*\n`,
      `Assessment: ${dollars(data.assessedValue)}`,
      `Market Value: ${dollars(data.estimatedMarketValueMid)}`,
      `Annual Taxes: ${dollars(data.taxAnnual)}`,
      `Case Strength: ${data.caseStrength}`,
      `Potential Savings: ${dollars(data.overpaymentLow)} \u2014 ${dollars(data.overpaymentHigh)}/yr`,
      `Comparable Sales: ${data.comparables?.length || 0}`,
      `Filing Deadline: ${data.filingDeadline || "N/A"}\n`,
      `Full analysis: gardenstate.ai/tax-shock`,
      `Prepare appeal: gardenstate.ai/appeal`,
      `\u2014 Garden State AI`,
    ].join("\n"),
  };
}
