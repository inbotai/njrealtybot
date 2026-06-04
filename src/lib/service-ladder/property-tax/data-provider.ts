/**
 * AssessmentDataProvider — interface for property assessment + comparable sales data.
 *
 * Ship with MockProvider (realistic NJ sample data).
 * To plug in real data, implement this interface against:
 *   - NJ MOD-IV public assessment records (via NJ Division of Taxation or county APIs)
 *   - County deed/sales records or MLS closed-sale data
 *   - NJ Table of Equalized Valuations for Director's Ratios
 *
 * Then swap the provider in the component:
 *   import { RealProvider } from "./real-provider";
 *   const provider = new RealProvider();
 */

import type { PropertyAssessment, ComparableSale } from "./types";

// ── Interface ──────────────────────────────────────────────────

export interface AssessmentDataProvider {
  getAssessment(address: string): Promise<PropertyAssessment | null>;
  getComparableSales(address: string): Promise<ComparableSale[]>;
  /** Director's Ratio by county (from NJ Table of Equalized Valuations) */
  getDirectorRatio(county: string): Promise<number | null>;
}

// ── NJ Director's Ratios (2024 Table of Equalized Valuations) ─

const NJ_DIRECTOR_RATIOS: Record<string, number> = {
  "Atlantic": 0.8812,
  "Bergen": 0.9789,
  "Burlington": 0.8654,
  "Camden": 0.9123,
  "Cape May": 0.7432,
  "Cumberland": 0.9456,
  "Essex": 0.8234,
  "Gloucester": 0.9312,
  "Hudson": 0.6789,
  "Hunterdon": 0.9567,
  "Mercer": 0.8956,
  "Middlesex": 0.9034,
  "Monmouth": 0.8745,
  "Morris": 0.9234,
  "Ocean": 0.8567,
  "Passaic": 0.9456,
  "Salem": 0.9234,
  "Somerset": 0.9123,
  "Sussex": 0.9345,
  "Union": 0.8567,
  "Warren": 0.9012,
};

// ── Mock Provider ──────────────────────────────────────────────

const MOCK_PROPERTIES: Record<string, {
  assessment: PropertyAssessment;
  comps: ComparableSale[];
}> = {
  // Scenario 1: Overpaying — assessed too high relative to market
  "123 maple st, montclair, nj": {
    assessment: {
      address: "123 Maple St, Montclair, NJ 07042",
      city: "Montclair",
      county: "Essex",
      assessedValue: 485000,
      landAssessment: 195000,
      improvementAssessment: 290000,
      taxAnnual: 14850,
      taxRate: 0.03062,
      taxYear: 2024,
      propertyClass: "Residential",
      lotSizeSqft: 6500,
      yearBuilt: 1928,
    },
    comps: [
      {
        address: "118 Maple St, Montclair, NJ",
        city: "Montclair", county: "Essex",
        salePrice: 415000, saleDate: "2024-03-15",
        livingAreaSqft: 1650, lotSizeSqft: 6200,
        bedrooms: 3, bathrooms: 2, yearBuilt: 1932,
        distanceMiles: 0.05, propertyType: "Single Family",
      },
      {
        address: "45 Valley Rd, Montclair, NJ",
        city: "Montclair", county: "Essex",
        salePrice: 430000, saleDate: "2024-01-22",
        livingAreaSqft: 1700, lotSizeSqft: 5900,
        bedrooms: 3, bathrooms: 2, yearBuilt: 1935,
        distanceMiles: 0.3, propertyType: "Single Family",
      },
      {
        address: "200 Grove St, Montclair, NJ",
        city: "Montclair", county: "Essex",
        salePrice: 440000, saleDate: "2024-05-08",
        livingAreaSqft: 1800, lotSizeSqft: 7000,
        bedrooms: 4, bathrooms: 2, yearBuilt: 1930,
        distanceMiles: 0.4, propertyType: "Single Family",
      },
      {
        address: "67 Chestnut Ave, Montclair, NJ",
        city: "Montclair", county: "Essex",
        salePrice: 405000, saleDate: "2023-11-30",
        livingAreaSqft: 1550, lotSizeSqft: 6100,
        bedrooms: 3, bathrooms: 1.5, yearBuilt: 1929,
        distanceMiles: 0.25, propertyType: "Single Family",
      },
    ],
  },

  // Scenario 2: Fairly assessed
  "456 broad st, bloomfield, nj": {
    assessment: {
      address: "456 Broad St, Bloomfield, NJ 07003",
      city: "Bloomfield",
      county: "Essex",
      assessedValue: 320000,
      landAssessment: 130000,
      improvementAssessment: 190000,
      taxAnnual: 9800,
      taxRate: 0.03062,
      taxYear: 2024,
      propertyClass: "Residential",
      lotSizeSqft: 5000,
      yearBuilt: 1955,
    },
    comps: [
      {
        address: "440 Broad St, Bloomfield, NJ",
        city: "Bloomfield", county: "Essex",
        salePrice: 380000, saleDate: "2024-02-10",
        livingAreaSqft: 1400, lotSizeSqft: 4800,
        bedrooms: 3, bathrooms: 1.5, yearBuilt: 1952,
        distanceMiles: 0.02, propertyType: "Single Family",
      },
      {
        address: "78 Belleville Ave, Bloomfield, NJ",
        city: "Bloomfield", county: "Essex",
        salePrice: 395000, saleDate: "2024-04-20",
        livingAreaSqft: 1500, lotSizeSqft: 5200,
        bedrooms: 3, bathrooms: 2, yearBuilt: 1958,
        distanceMiles: 0.3, propertyType: "Single Family",
      },
      {
        address: "155 Park Ave, Bloomfield, NJ",
        city: "Bloomfield", county: "Essex",
        salePrice: 370000, saleDate: "2024-06-01",
        livingAreaSqft: 1350, lotSizeSqft: 4600,
        bedrooms: 3, bathrooms: 1.5, yearBuilt: 1950,
        distanceMiles: 0.4, propertyType: "Single Family",
      },
    ],
  },

  // Scenario 3: Under-assessed (no appeal benefit)
  "789 river rd, edgewater, nj": {
    assessment: {
      address: "789 River Rd, Edgewater, NJ 07020",
      city: "Edgewater",
      county: "Bergen",
      assessedValue: 350000,
      landAssessment: 200000,
      improvementAssessment: 150000,
      taxAnnual: 8750,
      taxRate: 0.025,
      taxYear: 2024,
      propertyClass: "Residential",
      lotSizeSqft: 3200,
      yearBuilt: 2005,
    },
    comps: [
      {
        address: "775 River Rd, Edgewater, NJ",
        city: "Edgewater", county: "Bergen",
        salePrice: 520000, saleDate: "2024-03-01",
        livingAreaSqft: 1600, lotSizeSqft: 3100,
        bedrooms: 2, bathrooms: 2, yearBuilt: 2006,
        distanceMiles: 0.03, propertyType: "Condo/Townhouse",
      },
      {
        address: "810 River Rd, Edgewater, NJ",
        city: "Edgewater", county: "Bergen",
        salePrice: 495000, saleDate: "2024-01-15",
        livingAreaSqft: 1500, lotSizeSqft: 3000,
        bedrooms: 2, bathrooms: 2, yearBuilt: 2004,
        distanceMiles: 0.05, propertyType: "Condo/Townhouse",
      },
      {
        address: "650 Gorge Rd, Edgewater, NJ",
        city: "Edgewater", county: "Bergen",
        salePrice: 540000, saleDate: "2024-04-22",
        livingAreaSqft: 1650, lotSizeSqft: 3300,
        bedrooms: 3, bathrooms: 2, yearBuilt: 2007,
        distanceMiles: 0.2, propertyType: "Condo/Townhouse",
      },
    ],
  },
};

export class MockProvider implements AssessmentDataProvider {
  async getAssessment(address: string): Promise<PropertyAssessment | null> {
    const key = address.toLowerCase().trim();
    // Try exact match first, then partial
    const entry = MOCK_PROPERTIES[key]
      || Object.entries(MOCK_PROPERTIES).find(([k]) => key.includes(k.split(",")[0]))?.[1];
    return entry?.assessment ?? null;
  }

  async getComparableSales(address: string): Promise<ComparableSale[]> {
    const key = address.toLowerCase().trim();
    const entry = MOCK_PROPERTIES[key]
      || Object.entries(MOCK_PROPERTIES).find(([k]) => key.includes(k.split(",")[0]))?.[1];
    return entry?.comps ?? [];
  }

  async getDirectorRatio(county: string): Promise<number | null> {
    return NJ_DIRECTOR_RATIOS[county] ?? null;
  }
}
