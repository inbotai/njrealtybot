/**
 * Property Tax Appeal — types for the first ServiceLadder implementation.
 */

// ── Data provider types ────────────────────────────────────────

export interface PropertyAssessment {
  address: string;
  city: string;
  county: string;
  /** Total assessed value (land + improvements) */
  assessedValue: number;
  landAssessment: number;
  improvementAssessment: number;
  /** Annual property tax billed */
  taxAnnual: number;
  /** Effective tax rate as decimal (e.g. 0.0245 = 2.45%) */
  taxRate: number;
  /** Tax year the assessment applies to */
  taxYear: number;
  propertyClass: string;
  lotSizeSqft: number | null;
  yearBuilt: number | null;
}

export interface ComparableSale {
  address: string;
  city: string;
  county: string;
  salePrice: number;
  saleDate: string;
  livingAreaSqft: number | null;
  lotSizeSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
  distanceMiles: number;
  propertyType: string;
}

// ── Calc types ─────────────────────────────────────────────────

export interface Chapter123Analysis {
  /** County Director's Ratio (e.g. 0.9234 = 92.34%) */
  directorRatio: number;
  /** Common Level Range lower bound */
  commonLevelRangeLow: number;
  /** Common Level Range upper bound */
  commonLevelRangeHigh: number;
  /** Implied market value = assessedValue / directorRatio */
  impliedMarketValue: number;
  /** Estimated true market value from comps */
  estimatedMarketValueLow: number;
  estimatedMarketValueHigh: number;
  estimatedMarketValueMid: number;
  /** Is the property over-assessed? */
  isOverAssessed: boolean;
  /** Estimated annual overpayment range */
  overpaymentLow: number;
  overpaymentHigh: number;
  /** Appeal success likelihood: "high" | "moderate" | "low" */
  appealLikelihood: "high" | "moderate" | "low";
  /** NJ County Board filing deadline */
  filingDeadline: string;
  /** Comps used in the analysis */
  comparables: ComparableSale[];
}

// ── Lead types ─────────────────────────────────────────────────

export interface TaxAppealLead {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  county: string;
  estimatedOverpayment: number;
  message?: string;
}

// ── Packet types ───────────────────────────────────────────────

export interface AppealPacket {
  /** Comps table in structured form */
  comparablesTable: ComparableSale[];
  /** Chapter 123 valuation argument text */
  valuationArgument: string;
  /** Pre-filled petition data */
  petitionData: {
    propertyAddress: string;
    county: string;
    currentAssessment: number;
    requestedAssessment: number;
    taxYear: number;
    filingDeadline: string;
  };
  /** Formal cover letter text */
  coverLetter: string;
  /** Step-by-step filing checklist */
  filingChecklist: string[];
  /** Disclaimer */
  disclaimer: string;
}
