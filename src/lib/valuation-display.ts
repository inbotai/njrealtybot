import { positiveAmount } from "@/lib/sqft-display";

export interface PricingEstimateView {
  estimatedValue: number;
  lowRange: number;
  highRange: number;
  pricePerSqft: number | null;
}

export interface TaxMarketView {
  estimatedMarketValueLow: number;
  estimatedMarketValueHigh: number;
  estimatedMarketValueMid: number;
  impliedMarketValue: number;
}

function positiveDollars(value: unknown): number {
  return positiveAmount(value) ?? 0;
}

/** Keep a finite API dollar amount, including 0. Do not substitute another estimate. */
function apiDollars(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(/[$,\s]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/**
 * Fields shown on /value. The dollar estimate is the pricing API's estimatedValue.
 * A missing pricePerSqft stays null so the page does not render $0/sqft.
 */
export function pricingEstimateView(data: {
  estimatedValue?: unknown;
  lowRange?: unknown;
  highRange?: unknown;
  pricePerSqft?: unknown;
}): PricingEstimateView {
  return {
    estimatedValue: positiveDollars(data.estimatedValue),
    lowRange: positiveDollars(data.lowRange),
    highRange: positiveDollars(data.highRange),
    pricePerSqft: positiveAmount(data.pricePerSqft),
  };
}

/**
 * Market-value fields shown on /property-tax and /tax-shock.
 * Uses the tax-appeal API figures only. A pricing AVM or zestimate is not copied in.
 */
export function taxMarketView(data: {
  estimatedMarketValueLow?: unknown;
  estimatedMarketValueHigh?: unknown;
  estimatedMarketValueMid?: unknown;
  impliedMarketValue?: unknown;
}): TaxMarketView {
  return {
    estimatedMarketValueLow: apiDollars(data.estimatedMarketValueLow),
    estimatedMarketValueHigh: apiDollars(data.estimatedMarketValueHigh),
    estimatedMarketValueMid: apiDollars(data.estimatedMarketValueMid),
    impliedMarketValue: apiDollars(data.impliedMarketValue),
  };
}
