import { findMunicipalities, municipalityName } from "@/lib/nj-tax-rates";

export interface TaxRatePair {
  townLabel: string;
  townValue: string;
  propertyLabel: string;
  propertyValue: string;
  note: string;
}

/**
 * The municipal effective rate and this home's own rate are different numbers.
 * The town-wide rate is the official average per $100 of market value.
 * The property rate is this home's annual tax divided by its assessed value.
 */
export function taxRateComparison(input: {
  townName: string;
  townEffectiveRate: number;
  annualTax: number;
  assessedValue: number;
}): TaxRatePair | null {
  const townName = input.townName.trim();
  if (!townName || !(input.townEffectiveRate > 0) || !(input.annualTax > 0) || !(input.assessedValue > 0)) {
    return null;
  }
  const own = (input.annualTax / input.assessedValue) * 100;
  if (!Number.isFinite(own) || own <= 0) return null;
  return {
    townLabel: `${townName} town-wide effective tax rate`,
    townValue: `${input.townEffectiveRate.toFixed(3)} per $100 of market value`,
    propertyLabel: "This property's own tax rate",
    propertyValue: `${own.toFixed(3)} per $100 of assessed value`,
    note: "The town-wide rate is the municipal average on market value. This property's own rate is its annual tax divided by its assessed value.",
  };
}

export function taxRateComparisonForCity(input: {
  city: string;
  annualTax: number;
  assessedValue: number;
}): TaxRatePair | null {
  const city = input.city.trim();
  if (!city) return null;
  const found = findMunicipalities(city);
  const exact = found.filter((town) => municipalityName(town).toLowerCase() === city.toLowerCase());
  const town = exact.length === 1 ? exact[0] : found.length === 1 ? found[0] : null;
  if (!town) return null;
  return taxRateComparison({
    townName: municipalityName(town),
    townEffectiveRate: town.effectiveRate,
    annualTax: input.annualTax,
    assessedValue: input.assessedValue,
  });
}
