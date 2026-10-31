import type { NjMunicipality } from "@/lib/nj-tax-rates";

/**
 * Bergen County Board of Taxation list dated January 7, 2026 (subject to change).
 * Chapter 123 does not apply in the tax year a town implements a revaluation
 * or reassessment. District names match the 2025 general-tax-rate table.
 */
export const NJ_REVALUATION_SOURCE =
  "Bergen County Board of Taxation, 2026-2027 Revaluations and Reassessments, January 7, 2026 (subject to change)";

const BERGEN_2026 = new Set([
  "ALLENDALE BORO",
  "CARLSTADT BORO",
  "CLOSTER BORO",
  "CRESSKILL BORO",
  "DUMONT BORO",
  "ELMWOOD PARK BORO",
  "E RUTHERFORD BORO",
  "EDGEWATER BORO",
  "FAIRVIEW BORO",
  "HASBROUCK HGHTS BORO",
  "HOHOKUS BORO",
  "LEONIA BORO",
  "LITTLE FERRY BORO",
  "LYNDHURST TWP",
  "MAYWOOD BORO",
  "MOONACHIE BORO",
  "NORTH ARLINGTON BORO",
  "NORTHVALE BORO",
  "NORWOOD BORO",
  "OAKLAND BORO",
  "OLD TAPPAN BORO",
  "ORADELL BORO",
  "PALISADES PARK BORO",
  "PARAMUS BORO",
  "RAMSEY BORO",
  "RIDGEFIELD BORO",
  "RIVEREDGE BORO",
  "ROCHELLE PARK TWP",
  "ROCKLEIGH BORO",
  "SADDLE BROOK TWP",
  "SO HACKENSACK TWP",
  "TETERBORO BORO",
  "WASHINGTON TWP",
  "WESTWOOD BORO",
  "WOODCLIFF LAKE BORO",
  "WOOD RIDGE BORO",
]);

const BERGEN_2027 = new Set([
  "BERGENFIELD BORO",
  "CLIFFSIDE PARK BORO",
  "EMERSON BORO",
  "ENGLEWOOD CITY",
  "FAIRLAWN BORO",
  "FORT LEE BORO",
  "FRANKLIN LAKES BORO",
  "GARFIELD CITY",
  "GLEN ROCK BORO",
  "HACKENSACK CITY",
  "HARRINGTON PARK BORO",
  "HAWORTH BORO",
  "HILLSDALE BORO",
  "LODI BORO",
  "MAHWAH TWP",
  "MIDLAND PARK BORO",
  "MONTVALE BORO",
  "PARK RIDGE BORO",
  "RIDGEWOOD VILLAGE",
  "RIVERVALE TWP",
  "RUTHERFORD BORO",
  "TENAFLY BORO",
  "UPPER SADDLE RIV BORO",
  "WYCKOFF TWP",
]);

const BY_YEAR: Record<number, Set<string>> = {
  2026: BERGEN_2026,
  2027: BERGEN_2027,
};

export function isRevaluationYear(
  muni: Pick<NjMunicipality, "county" | "district">,
  taxYear: number,
): boolean {
  if (muni.county.toLowerCase() !== "bergen") return false;
  return BY_YEAR[taxYear]?.has(muni.district) === true;
}
