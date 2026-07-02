/**
 * Marketing claims constants — single source of truth.
 *
 * Every marketing figure used on the site must come from here.
 * Each has a source field for auditability. Figures with
 * source "NEEDS_CITATION" should be reviewed and either
 * cited, softened ("up to"), or removed.
 */

export interface MarketingStat {
  value: string;
  label: string;
  source: string;
}

export const MARKETING_STATS: Record<string, MarketingStat> = {
  // MLS data — verifiable from our database
  MLS_LISTINGS: {
    value: "60,000+",
    label: "MLS listings analyzed",
    source: "Internal: NJMLS ~25K + GSMLS ~37K+ (active + sold)",
  },
  NJ_TOWNS: {
    value: "450+",
    label: "NJ towns covered",
    source: "Internal: 532 cities with listings in our database",
  },
  NJ_COUNTIES: {
    value: "21",
    label: "NJ counties covered",
    source: "NJ has 21 counties — all covered by NJMLS + GSMLS",
  },
  INSTANT_VALUATION: {
    value: "30 sec",
    label: "Instant valuation",
    source: "Internal: CMA engine response time",
  },

  // FSBO claims — need citation
  FSBO_PRICE_GAP: {
    value: "$30,000",
    label: "Average FSBO price gap vs agent-listed",
    source: "NEEDS_CITATION — commonly cited NAR figure but exact year/study needed",
  },
  FSBO_UNDERPRICE_PCT: {
    value: "8-12%",
    label: "FSBO underpricing range",
    source: "NEEDS_CITATION — industry estimate, no specific study cited",
  },
  FSBO_HIRE_AGENT_PCT: {
    value: "87%",
    label: "FSBO sellers who end up hiring an agent",
    source: "NEEDS_CITATION — commonly attributed to NAR Profile of Home Buyers and Sellers",
  },
  VALE_NET_CLAIM: {
    value: "15-20%",
    label: "FSBO sellers net less than agent-listed",
    source: "NEEDS_CITATION — used in Vale prompt, no specific study",
  },

  // Platform stats — internal
  PROPERTIES_ANALYZED: {
    value: "50,000+",
    label: "Properties analyzed",
    source: "Internal: aggregate of CMA runs + property lookups",
  },
  VALE_AVAILABILITY: {
    value: "24/7",
    label: "Vale AI available",
    source: "Internal: WhatsApp + web chat always on",
  },
};

/**
 * Get all stats flagged as needing citation.
 */
export function getUncitedStats(): Array<{ key: string; stat: MarketingStat }> {
  return Object.entries(MARKETING_STATS)
    .filter(([, s]) => s.source.includes("NEEDS_CITATION"))
    .map(([key, stat]) => ({ key, stat }));
}
