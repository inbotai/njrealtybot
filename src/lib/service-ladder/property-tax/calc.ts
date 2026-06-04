/**
 * Chapter 123 Property Tax Overpayment Calculator
 *
 * PURE — zero LLM calls, zero side effects, fully deterministic.
 *
 * How it works:
 * 1. NJ assesses properties at a fraction of market value. The "Director's Ratio"
 *    (from the annual Table of Equalized Valuations) is the county-wide ratio of
 *    assessed value to true market value.
 * 2. The "Common Level Range" is the Director's Ratio +/- 15%. If a property's
 *    individual ratio falls ABOVE the upper bound of this range, the property is
 *    over-assessed and the owner may appeal under N.J.S.A. 54:51A-6 (Chapter 123).
 * 3. We estimate true market value from comparable sales, then check if the
 *    assessment implies a higher value than market supports.
 *
 * The overpayment is a RANGE (not a point estimate) — we use the low and high
 * ends of the comp-derived market value estimate.
 */

import type {
  PropertyAssessment,
  ComparableSale,
  Chapter123Analysis,
} from "./types";

// ── Constants ──────────────────────────────────────────────────

/** NJ Common Level Range is Director's Ratio +/- 15% */
const CLR_BAND = 0.15;

/** NJ County Board of Taxation filing deadline: April 1 of the tax year */
function getFilingDeadline(taxYear: number): string {
  // For the current tax year, deadline is April 1.
  // If April 1 has passed, the next opportunity is April 1 of the following year.
  const now = new Date();
  const deadlineThisYear = new Date(taxYear, 3, 1); // April 1
  if (now > deadlineThisYear) {
    return `April 1, ${taxYear + 1}`;
  }
  return `April 1, ${taxYear}`;
}

// ── Core calc ──────────────────────────────────────────────────

export function analyzePropertyTax(
  assessment: PropertyAssessment,
  comps: ComparableSale[],
  directorRatio: number,
): Chapter123Analysis {
  // 1. Common Level Range
  const commonLevelRangeLow = directorRatio * (1 - CLR_BAND);
  const commonLevelRangeHigh = directorRatio * (1 + CLR_BAND);

  // 2. Estimate market value from comps
  const salePrices = comps.map((c) => c.salePrice).sort((a, b) => a - b);
  const estimatedMarketValueLow = salePrices[0];
  const estimatedMarketValueHigh = salePrices[salePrices.length - 1];
  const estimatedMarketValueMid =
    salePrices.reduce((sum, p) => sum + p, 0) / salePrices.length;

  // 3. Implied market value from assessment
  const impliedMarketValue = assessment.assessedValue / directorRatio;

  // 4. Check if over-assessed
  // The property's individual ratio = assessedValue / trueMarketValue
  // If this ratio > commonLevelRangeHigh, it's over-assessed.
  // We use the mid comp estimate as "true market value" for the binary check.
  const propertyRatio = assessment.assessedValue / estimatedMarketValueMid;
  const isOverAssessed = propertyRatio > commonLevelRangeHigh;

  // 5. Calculate overpayment range
  // What the assessment SHOULD be = marketValue * directorRatio
  // Overpayment = (currentTax - fairTax)
  const fairAssessmentFromHigh = estimatedMarketValueHigh * directorRatio;
  const fairAssessmentFromLow = estimatedMarketValueLow * directorRatio;

  const overpaymentFromLow = Math.max(
    0,
    (assessment.assessedValue - fairAssessmentFromHigh) * assessment.taxRate,
  );
  const overpaymentFromHigh = Math.max(
    0,
    (assessment.assessedValue - fairAssessmentFromLow) * assessment.taxRate,
  );

  // Low overpayment = using highest comp (most generous to current assessment)
  // High overpayment = using lowest comp (most aggressive reduction)
  const overpaymentLow = Math.round(overpaymentFromLow);
  const overpaymentHigh = Math.round(overpaymentFromHigh);

  // 6. Appeal likelihood
  let appealLikelihood: "high" | "moderate" | "low";
  if (isOverAssessed && overpaymentLow > 500) {
    appealLikelihood = "high";
  } else if (overpaymentHigh > 200) {
    appealLikelihood = "moderate";
  } else {
    appealLikelihood = "low";
  }

  return {
    directorRatio,
    commonLevelRangeLow,
    commonLevelRangeHigh,
    impliedMarketValue: Math.round(impliedMarketValue),
    estimatedMarketValueLow,
    estimatedMarketValueHigh,
    estimatedMarketValueMid: Math.round(estimatedMarketValueMid),
    isOverAssessed,
    overpaymentLow,
    overpaymentHigh,
    appealLikelihood,
    filingDeadline: getFilingDeadline(assessment.taxYear),
    comparables: comps,
  };
}

// ── Helpers for display ────────────────────────────────────────

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}
