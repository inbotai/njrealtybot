import table from "../data/nj-2025-general-tax-rates.json";

/**
 * Official 2025 general and effective tax rates for all 564 NJ municipalities.
 * Source: NJ Division of Taxation, 2025 General Tax Rates.
 * General rate: dollars per $100 of assessed value.
 * Effective rate: dollars per $100 of market (true) value.
 * Equalization ratio = effective / general, so assessed ≈ market × ratio.
 */

export interface NjMunicipality {
  county: string;
  district: string;
  generalRate: number;
  effectiveRate: number;
}

export const NJ_TAX_RATE_YEAR = table.year;
export const NJ_TAX_RATE_SOURCE = table.source;

const MUNICIPALITIES: NjMunicipality[] = table.municipalities.map((row) => ({
  county: row.county,
  district: row.district,
  generalRate: row.general,
  effectiveRate: row.effective,
}));

const EXTRA_ALIASES: Record<string, string[]> = {
  "FAIRLAWN BORO": ["FAIR LAWN"],
  "RIVEREDGE BORO": ["RIVER EDGE"],
  "HOHOKUS BORO": ["HO HO KUS"],
};

const SUFFIXES = ["BOROUGH", "CITY", "TOWN", "TOWNSHIP", "VILLAGE"];

export function expandPlaceName(raw: string): string {
  return raw
    .replace(/\bTWNSHP\b/g, "TOWNSHIP")
    .replace(/\bTWP\b/g, "TOWNSHIP")
    .replace(/\bBORO\b/g, "BOROUGH")
    .replace(/\bHGHTS\b/g, "HEIGHTS")
    .replace(/\bHTS\b/g, "HEIGHTS")
    .replace(/\bRIV\b/g, "RIVER")
    .replace(/\bMT\b/g, "MOUNT")
    .replace(/\bSO\b/g, "SOUTH")
    .replace(/\bNO\b/g, "NORTH")
    .replace(/\bE\b/g, "EAST")
    .replace(/\bW\b/g, "WEST")
    .replace(/\bN\b/g, "NORTH")
    .replace(/\bS\b/g, "SOUTH")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePlaceText(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/['’.]/g, "")
    .replace(/-/g, "")
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return expandPlaceName(cleaned);
}

function aliasesFor(muni: NjMunicipality): string[] {
  const expanded = expandPlaceName(muni.district);
  const names = new Set<string>([expanded, ...(EXTRA_ALIASES[muni.district] || [])]);
  let short = expanded;
  for (let i = 0; i < 2; i++) {
    const suffix = SUFFIXES.find((item) => short.endsWith(` ${item}`));
    if (!suffix) break;
    short = short.slice(0, -suffix.length).trim();
    if (short.length >= 3) names.add(short);
  }
  return [...names].filter((name) => name.length >= 3);
}

const ALIAS_MAP = new Map<string, NjMunicipality[]>();
for (const muni of MUNICIPALITIES) {
  for (const alias of aliasesFor(muni)) {
    const list = ALIAS_MAP.get(alias) || [];
    list.push(muni);
    ALIAS_MAP.set(alias, list);
  }
}
const ALIAS_ORDER = [...ALIAS_MAP.keys()].sort((a, b) => b.length - a.length);

function disambiguate(found: NjMunicipality[], norm: string): NjMunicipality[] {
  const mentioned = [...new Set(found.map((muni) => muni.county.toUpperCase()))].filter((county) =>
    norm.includes(` ${county} `),
  );
  if (!mentioned.length) return found;
  const narrowed = found.filter((muni) => mentioned.includes(muni.county.toUpperCase()));
  return narrowed.length ? narrowed : found;
}

/** Municipalities named in free text. Longer names win, so South Hackensack is not also Hackensack. */
export function findMunicipalities(text: string): NjMunicipality[] {
  const norm = ` ${normalizePlaceText(text)} `;
  const occupied = new Array<boolean>(norm.length).fill(false);
  const found: NjMunicipality[] = [];
  const seen = new Set<string>();

  for (const alias of ALIAS_ORDER) {
    const needle = ` ${alias} `;
    let from = 0;
    while (from < norm.length) {
      const at = norm.indexOf(needle, from);
      if (at < 0) break;
      const start = at + 1;
      const end = start + alias.length;
      const overlaps = occupied.slice(start, end).some(Boolean);
      const nextWord = norm.slice(end + 1).split(" ")[0];
      if (!overlaps && nextWord !== "COUNTY") {
        for (let i = start; i < end; i++) occupied[i] = true;
        for (const muni of ALIAS_MAP.get(alias) || []) {
          const key = `${muni.county}|${muni.district}`;
          if (seen.has(key)) continue;
          seen.add(key);
          found.push(muni);
        }
      }
      from = at + 1;
    }
  }

  return disambiguate(found, norm);
}

export function equalizationRatio(muni: NjMunicipality): number {
  return muni.effectiveRate / muni.generalRate;
}

export function municipalityLabel(muni: NjMunicipality): string {
  const expanded = expandPlaceName(muni.district)
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  return `${expanded} (${muni.county} County)`;
}

/** Home prices mentioned in a question. Ignores years and small figures. */
export function marketPricesIn(text: string): number[] {
  const found: number[] = [];
  const add = (n: number) => {
    if (n >= 50000 && n <= 50000000) found.push(Math.round(n));
  };
  for (const match of text.matchAll(/\$\s*(\d{1,3}(?:,\d{3})+|\d{2,7}(?:\.\d+)?)(?:\s*([kK]))?/g)) {
    let n = Number(match[1].replace(/,/g, ""));
    if (match[2]) n *= 1000;
    add(n);
  }
  for (const match of text.matchAll(/\b(\d{2,4}(?:\.\d+)?)\s*[kK]\b/g)) {
    add(Number(match[1]) * 1000);
  }
  return [...new Set(found)];
}

export function taxFromMarketValue(muni: NjMunicipality, marketValue: number): { assessed: number; tax: number } {
  const ratio = equalizationRatio(muni);
  const assessed = Math.round(marketValue * ratio);
  const tax = Math.round(marketValue * muni.effectiveRate / 100);
  return { assessed, tax };
}

export function allMunicipalities(): readonly NjMunicipality[] {
  return MUNICIPALITIES;
}
