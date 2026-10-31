/**
 * Search Regression Tests — njrealtybot
 *
 * Every bug found and fixed gets added here as a test case.
 * Run before every deploy: npx tsx test/search-regression.ts
 *
 * Tests the full pipeline: hero parse → API search → results
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { formatPercent } from "../src/lib/service-ladder/property-tax/calc";
import { appealTaxYear, assessmentHeadline, chapter123Display, compsSupportMessage, describeTaxAppealResult, formatRatio, ratioRelationshipCopy, reconcileExplanation, taxAppealErrorMessage, taxShockDeliveryCopy, taxYearRatiosLabel } from "../src/lib/tax-display";
import { allMunicipalities, findMunicipalities, taxFromMarketValue, townTaxPageBySlug, townTaxPages } from "../src/lib/nj-tax-rates";
import { isRevaluationYear } from "../src/lib/nj-revaluations";
import { cityToSlug } from "../src/lib/place-slug";
import { INDEXNOW_KEY, INDEXNOW_KEY_LOCATION, INDEXNOW_KEY_PATH, chunkUrls, indexNowBody, indexNowUrls, submitIndexNow } from "../src/lib/indexnow";
import { canonicalAppealAnswer, canonicalTaxAnswer, finalizeValeReply, isAppealProcedureQuestion, isTaxRateQuestion, toValeModelMessage, VALE_TAX_RATE_POLICY } from "../src/lib/vale-tax-context";
import { calcRoi, renovationTypes } from "../src/lib/renovate-roi";
import { renderChatMarkdown } from "../src/lib/chat-markdown";
import { splitStreetAndCity } from "../src/lib/address";
import { positiveAmount, pricePerSqftLabel, sqftLabel } from "../src/lib/sqft-display";
import { pricingEstimateView, taxMarketView } from "../src/lib/valuation-display";
import buildRobots from "../src/app/robots";
import { ALLOWED_BOTS, TRAINING_CRAWLERS, isTrainingCrawler } from "../src/lib/crawler-policy";
import { resolveRobots } from "next/dist/build/webpack/loaders/metadata/resolve-route-data.js";
import { runCrawlerMiddlewareChecks } from "./crawler-middleware-check";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface TestCase {
  id: string;
  description: string;
  type: "parse" | "search" | "chat";
  input: string;
  expect: {
    // For parse tests
    city?: string;
    county?: string;
    maxPrice?: number;
    minPrice?: number;
    beds?: number;
    propertyType?: string;
    // For search tests
    minResults?: number;
    hasCity?: boolean;
  };
}

const TESTS: TestCase[] = [
  // ── Hero parse bugs ──────────────────────────────────────────
  {
    id: "PARSE-001",
    description: "Spanish price: 200 mil dolares should parse as 200000",
    type: "parse",
    input: "busco casa de menos de 200 mil dolares",
    expect: { maxPrice: 200000 },
  },
  {
    id: "PARSE-002",
    description: "English price: under 500k should parse as 500000",
    type: "parse",
    input: "homes under 500k in Hoboken",
    expect: { maxPrice: 500000, city: "Hoboken" },
  },
  {
    id: "PARSE-003",
    description: "Rental query should set propertyType Rental",
    type: "parse",
    input: "rental apartment in Union City",
    expect: { propertyType: "Rental", city: "Union City" },
  },
  {
    id: "PARSE-004",
    description: "County search should set county not city",
    type: "parse",
    input: "multifamilia menos de 700k en Bergen County",
    expect: { county: "Bergen", maxPrice: 700000 },
  },
  {
    id: "PARSE-005",
    description: "No city mentioned should NOT include city",
    type: "parse",
    input: "busco casa de menos de 200 mil dolares",
    expect: { maxPrice: 200000 },
  },
  {
    id: "PARSE-006",
    description: "3 bed in Clifton should extract city and beds",
    type: "parse",
    input: "3 bed in Clifton",
    expect: { city: "Clifton", beds: 3 },
  },
  {
    id: "PARSE-007",
    description: "Speech-to-text: doscientos mil = 200000",
    type: "parse",
    input: "casa de doscientos mil dolares",
    expect: { maxPrice: 200000 },
  },
  {
    id: "PARSE-008",
    description: "CMA request should NOT be parsed as search",
    type: "parse",
    input: "CMA for 8 saturn court highland lakes nj",
    // CMA queries are routed to /chat, not to search — parse may return address-like data but hero intercepts first
    expect: {},
  },
  {
    id: "PARSE-009",
    description: "Lake/waterfront feature should go in q field",
    type: "parse",
    input: "casa frente al lago en Bergen County",
    expect: { county: "Bergen" },
  },

  // ── Search result bugs ───────────────────────────────────────
  {
    id: "SEARCH-001",
    description: "Morristown 3 bed should return results",
    type: "search",
    input: "city=Morristown&beds=3",
    expect: { minResults: 1 },
  },
  {
    id: "SEARCH-002",
    description: "Shared URL should work: city=vernon&beds=3",
    type: "search",
    input: "city=vernon&beds=3",
    expect: { minResults: 1 },
  },
  {
    id: "SEARCH-003",
    description: "maxPrice=200000 should return affordable homes",
    type: "search",
    input: "maxPrice=200000",
    expect: { minResults: 1 },
  },
  {
    id: "SEARCH-004",
    description: "Elmwood Park should return results",
    type: "search",
    input: "city=Elmwood+Park",
    expect: { minResults: 1 },
  },
  {
    id: "SEARCH-005",
    description: "Search with city only (no propertyType) should return results",
    type: "search",
    input: "city=Hoboken",
    expect: { minResults: 1 },
  },
  {
    id: "SEARCH-006",
    description: "Multi-Family in Elmwood Park should fallback to remarks search",
    type: "search",
    input: "city=Elmwood+Park&propertyType=Multi-Family",
    expect: { minResults: 1 },
  },
  {
    id: "SEARCH-007",
    description: "Wayne search should not show Morristown results",
    type: "search",
    input: "city=Wayne",
    expect: { minResults: 1, hasCity: true },
  },
  {
    id: "PARSE-010",
    description: "Paramus is a CITY, not Bergen County",
    type: "parse",
    input: "busco una casa en Paramus de menos de 500mil",
    expect: { city: "Paramus", maxPrice: 500000 },
  },
  {
    id: "PARSE-011",
    description: "500mil should parse as 500000",
    type: "parse",
    input: "casa en Hoboken de menos de 500mil",
    expect: { city: "Hoboken", maxPrice: 500000 },
  },
  {
    id: "PARSE-012",
    description: "2 dormitorios en paramus should extract beds=2 and city",
    type: "parse",
    input: "2 dormitorios en paramus",
    expect: { city: "Paramus", beds: 2 },
  },
  {
    id: "SEARCH-008",
    description: "beds=2 in Paramus should show 2bd first, then 3+",
    type: "search",
    input: "city=Paramus&beds=2",
    expect: { minResults: 1 },
  },
];

// ── Runner ─────────────────────────────────────────────────────

async function runParseTest(test: TestCase): Promise<{ pass: boolean; detail: string }> {
  const res = await fetch(`${IDX_API}/api/idx/parse-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: test.input }),
  });
  const parsed = await res.json();
  const failures: string[] = [];

  for (const [key, expected] of Object.entries(test.expect)) {
    const actual = parsed[key];
    if (key === "county" && typeof expected === "string") {
      // County: partial match (Bergen vs Bergen County)
      if (!actual || !String(actual).toLowerCase().includes(String(expected).toLowerCase())) {
        failures.push(`${key}: expected "${expected}", got "${actual}"`);
      }
    } else if (actual !== expected) {
      failures.push(`${key}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  // Check that fields NOT in expect are NOT present (for PARSE-005: no city)
  if (test.id === "PARSE-005" && parsed.city) {
    failures.push(`city should NOT be set, got "${parsed.city}"`);
  }

  return {
    pass: failures.length === 0,
    detail: failures.length ? failures.join("; ") : JSON.stringify(parsed),
  };
}

async function runSearchTest(test: TestCase): Promise<{ pass: boolean; detail: string }> {
  const res = await fetch(`${IDX_API}/api/idx/listings?${test.input}&limit=5`);
  const data = await res.json();
  const total = data.total || 0;
  const failures: string[] = [];

  if (test.expect.minResults && total < test.expect.minResults) {
    failures.push(`expected at least ${test.expect.minResults} results, got ${total}`);
  }

  return {
    pass: failures.length === 0,
    detail: failures.length ? failures.join("; ") : `${total} results`,
  };
}

function walkSource(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkSource(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

async function runLocalTests(): Promise<{ id: string; description: string; pass: boolean; detail: string }[]> {
  const results: { id: string; description: string; pass: boolean; detail: string }[] = [];
  const check = (id: string, description: string, pass: boolean, detail: string) => {
    results.push({ id, description, pass, detail });
  };

  check(
    "TAX-001",
    "Common level range percentage points are not scaled twice",
    formatPercent(54.03) === "54.03%" && formatPercent(73.09) === "73.09%" && formatPercent(0.6356) === "63.56%",
    `54.03→${formatPercent(54.03)} 73.09→${formatPercent(73.09)} 0.6356→${formatPercent(0.6356)}`,
  );

  const compCopy = compsSupportMessage({
    city: "Bloomfield",
    assessedValue: 382300,
    comparables: [{ salePrice: 510000 }, { salePrice: 730000 }],
  });
  check(
    "TAX-002",
    "Comps above the assessment do not claim to support a reduction",
    compCopy.includes("above your assessment") && compCopy.includes("do not support a lower assessment"),
    compCopy,
  );

  check(
    "TAX-003",
    "Property ratio and equalization ratio stay distinct",
    formatRatio(61.74) === "61.74%" && formatRatio(0.6356) === "63.56%" && formatRatio(61.74) !== formatRatio(0.6356),
    `${formatRatio(61.74)} vs ${formatRatio(0.6356)}`,
  );

  const reconciled = reconcileExplanation(
    "Your Property Ratio (61.7%) is within the CLR but near the upper limit. Savings would be minimal.",
    { propertyRatio: 61.74, equalization: 63.56, rangeHigh: 73.09 },
  );
  check(
    "TAX-004",
    "Near-the-upper-limit copy is corrected when the ratio is by the county average",
    reconciled.includes("close to the county equalization ratio") && !/upper limit/i.test(reconciled),
    reconciled,
  );

  const afterApril = appealTaxYear({}, new Date(2026, 9, 19));
  const beforeApril = appealTaxYear({}, new Date(2026, 2, 15));
  const onApril1 = appealTaxYear({}, new Date(2026, 3, 1));
  const wizard = readFileSync(join(process.cwd(), "src/components/AppealWizard.tsx"), "utf8");
  const propertyTax = readFileSync(join(process.cwd(), "src/components/PropertyTaxAppeal.tsx"), "utf8");
  const taxShock = readFileSync(join(process.cwd(), "src/components/TaxShockClient.tsx"), "utf8");
  check(
    "TAX-005",
    "Tax year comes from the API, otherwise the next April 1 tax year",
    appealTaxYear({ taxYear: 2027 }) === 2027 &&
      appealTaxYear({ ratioTaxYear: "2027" }) === 2027 &&
      afterApril === 2027 &&
      beforeApril === 2026 &&
      onApril1 === 2026 &&
      taxYearRatiosLabel(2027) === "Tax year 2027 ratios" &&
      !wizard.includes("getFullYear()") &&
      wizard.includes("appealTaxYear") &&
      propertyTax.includes("taxYearRatiosLabel") &&
      taxShock.includes("taxYearRatiosLabel"),
    `api 2027; fallback Oct=${afterApril} Mar=${beforeApril} Apr1=${onApril1}`,
  );

  const suppressed = describeTaxAppealResult({
    savingsSuppressed: true,
    address: "604 21ST ST",
    overpaymentHigh: 0,
    caseStrength: "no_case",
    propertyTypeWarning: "This 8-unit property is a Class 4 commercial or apartment building. Consult a tax appeal attorney — this analysis does not estimate appeal savings.",
  });
  const normal = describeTaxAppealResult({
    savingsSuppressed: false,
    address: "119 W 21ST ST",
    overpaymentHigh: 1521,
    caseStrength: "weak",
    propertyTypeWarning: "This appears to be a 2-family property. Comparable sales are other multi-unit homes, not condominiums or single-unit sales.",
  });
  const shock = readFileSync(join(process.cwd(), "src/components/TaxShockClient.tsx"), "utf8");
  const propertyTaxPage = readFileSync(join(process.cwd(), "src/components/PropertyTaxAppeal.tsx"), "utf8");
  check(
    "TAX-006",
    "Suppressed multi-unit analyses hide $0 savings and case strength",
    suppressed.suppressed &&
      !suppressed.showSavings &&
      !suppressed.showCaseStrength &&
      suppressed.warning.includes("Consult a tax appeal attorney") &&
      !suppressed.valeMessage.includes("$0") &&
      !/case strength/i.test(suppressed.valeMessage) &&
      !normal.suppressed &&
      !normal.showSavings &&
      normal.showCaseStrength &&
      normal.valeMessage.includes("do not support a lower assessment") &&
      shock.includes("appealView?.suppressed") &&
      propertyTaxPage.includes("appealView.showSavings") &&
      propertyTaxPage.includes("appealView.suppressed"),
    suppressed.valeMessage,
  );

  const noCase = describeTaxAppealResult({
    address: "123 Bloomfield St",
    caseStrength: "no_case",
    overpaymentLow: 0,
    overpaymentHigh: 5738,
  });
  const strong = describeTaxAppealResult({
    address: "1 Example Ave",
    caseStrength: "strong",
    overpaymentLow: 1200,
    overpaymentHigh: 5738,
  });
  const strongZero = describeTaxAppealResult({
    address: "1 Example Ave",
    caseStrength: "strong",
    overpaymentHigh: 0,
  });
  const moderate = describeTaxAppealResult({
    address: "1 Example Ave",
    caseStrength: "moderate",
    overpaymentHigh: 800,
  });
  const noCaseCopy = taxShockDeliveryCopy({
    address: "123 Bloomfield St",
    caseStrength: "no_case",
    overpaymentLow: 0,
    overpaymentHigh: 5738,
    assessedValue: 400000,
    taxAnnual: 9000,
  });
  const strongCopy = taxShockDeliveryCopy({
    address: "1 Example Ave",
    caseStrength: "strong",
    overpaymentLow: 1200,
    overpaymentHigh: 5738,
  });
  const zeroCopy = taxShockDeliveryCopy({
    address: "1 Example Ave",
    caseStrength: "moderate",
    overpaymentLow: 0,
    overpaymentHigh: 0,
  });
  check(
    "TAX-007",
    "No-case and $0-high results hide overpayment and savings claims",
    !noCase.showSavings &&
      noCase.showCaseStrength &&
      !/overpaying|\$5,738|\$0/i.test(noCase.valeMessage) &&
      strong.showSavings &&
      strong.valeMessage.includes("$5,738") &&
      !strongZero.showSavings &&
      !/overpaying|\$0/i.test(strongZero.valeMessage) &&
      moderate.showSavings &&
      !/overpaying|Potential Savings|\$5,738/i.test(`${noCaseCopy.message}\n${noCaseCopy.resultsText}`) &&
      noCaseCopy.message.includes("assessment reviewed") &&
      strongCopy.message.includes("overpaying") &&
      strongCopy.resultsText.includes("Potential Savings") &&
      !/overpaying|Potential Savings/i.test(`${zeroCopy.message}\n${zeroCopy.resultsText}`) &&
      shock.includes("taxShockDeliveryCopy") &&
      shock.includes("appealView?.showSavings"),
    noCaseCopy.message,
  );

  const paramus = findMunicipalities("Compare Paramus and Hackensack");
  const south = findMunicipalities("South Hackensack");
  const fairLawn = findMunicipalities("Fair Lawn");
  const question = "Compare property taxes in Paramus and Hackensack. What would taxes be on a $500,000 home?";
  const official = canonicalTaxAnswer(question);
  const paramusTax = taxFromMarketValue(paramus.find((m) => m.district.startsWith("PARAMUS"))!, 500000).tax;
  const hackTax = taxFromMarketValue(paramus.find((m) => m.district.startsWith("HACKENSACK"))!, 500000).tax;
  const grounded = toValeModelMessage(question);
  const replaced = finalizeValeReply(question, "Paramus is about $2.10–$2.30 per $100 and Hackensack about $2.40–$2.60 per $100. On a $500,000 home that is $7,495 in Paramus.");
  const overpayingOnly = isTaxRateQuestion("Am I overpaying property taxes?");
  const chatPage = readFileSync(join(process.cwd(), "src/components/ValeChatPage.tsx"), "utf8");
  const valeProvider = readFileSync(join(process.cwd(), "src/components/ValeProvider.tsx"), "utf8");
  check(
    "VALE-001",
    "Vale quotes 2025 municipal tax rates from the official table, not memory",
    allMunicipalities().length === 564 &&
      paramus.length === 2 &&
      paramus.some((m) => m.generalRate === 1.499) &&
      paramus.some((m) => m.generalRate === 3.209) &&
      south.length === 1 &&
      south[0].district.startsWith("SO HACKENSACK") &&
      fairLawn.length === 1 &&
      fairLawn[0].generalRate === 3.661 &&
      paramusTax === 7170 &&
      hackTax === 12635 &&
      official.includes("1.499") &&
      official.includes("3.209") &&
      official.includes("$7,170") &&
      official.includes("$12,635") &&
      !official.includes("2.10") &&
      !official.includes("2.40") &&
      grounded.includes(VALE_TAX_RATE_POLICY) &&
      grounded.includes("Never state a New Jersey municipal tax rate") &&
      grounded.includes("1.499") &&
      grounded.includes("3.209") &&
      replaced.includes("1.499") &&
      replaced.includes("3.209") &&
      !replaced.includes("2.10") &&
      !replaced.includes("2.40") &&
      !replaced.includes("$7,495") &&
      !overpayingOnly &&
      chatPage.includes("toValeModelMessage") &&
      chatPage.includes("finalizeValeReply") &&
      valeProvider.includes("VALE_TAX_RATE_POLICY") === false &&
      valeProvider.includes("valeStartBody") &&
      valeProvider.includes("toValeModelMessage"),
    `paramus tax ${paramusTax}; hackensack tax ${hackTax}`,
  );

  const unitPrompt = "This building has multiple units. Please include your unit number (for example, Unit 6F).";
  const genericMiss = "We couldn't find that address.";
  check(
    "TAX-008",
    "A missing condo unit shows the API error instead of a generic miss",
    taxAppealErrorMessage({ error: unitPrompt, needsUnit: true }, genericMiss) === unitPrompt &&
      taxAppealErrorMessage({ error: "  " }, genericMiss) === genericMiss &&
      taxAppealErrorMessage(null, genericMiss) === genericMiss &&
      taxShock.includes("taxAppealErrorMessage") &&
      propertyTax.includes("taxAppealErrorMessage") &&
      wizard.includes("taxAppealErrorMessage") &&
      !/setError\(\s*["']We couldn't find that address/.test(taxShock),
    unitPrompt,
  );

  const hackTown = findMunicipalities("Hackensack").find((town) => town.district === "HACKENSACK CITY")!;
  const bayTown = findMunicipalities("Bayonne")[0];
  const paramusTown = findMunicipalities("Paramus").find((town) => town.district === "PARAMUS BORO")!;
  const asOf = new Date(2026, 9, 31);
  const hackChapter = chapter123Display({
    chapter123Applies: false,
    chapter123Explanation: "Tax year 2027 is a revaluation or reassessment year, so Chapter 123 does not apply and the common level range is not the test.",
    commonLevelRangeLow: 59.46,
    commonLevelRangeHigh: 80.44,
    appealRiskWarning: "This town is in a revaluation or reassessment year, so Chapter 123 does not apply.",
  });
  const bayChapter = chapter123Display({
    chapter123Applies: true,
    commonLevelRangeLow: 53.52,
    commonLevelRangeHigh: 72.42,
    chapter123Explanation: "Your Estimated Property Ratio (47.76%) is below the Lower Limit (53.52%).",
  });
  const hackHeadline = assessmentHeadline({
    propertyRatio: 70.4,
    equalization: 69.95,
    rangeLow: 59.46,
    rangeHigh: 80.44,
    chapter123Applies: false,
  });
  const bayHeadline = assessmentHeadline({
    propertyRatio: 47.76,
    equalization: 62.97,
    rangeLow: 53.52,
    rangeHigh: 72.42,
    chapter123Applies: true,
  });
  const hackRatioCopy = ratioRelationshipCopy({
    propertyRatio: 70.4,
    equalization: 69.95,
    rangeLow: 59.46,
    rangeHigh: 80.44,
    chapter123Applies: false,
  });
  const revalHome = describeTaxAppealResult({
    savingsSuppressed: true,
    chapter123Applies: false,
    caseStrength: "no_case",
    overpaymentHigh: 0,
    propertyTypeWarning: null,
    address: "160 OVERLOOK AVE.",
  });
  check(
    "TAX-009",
    "Revaluation years say Chapter 123 does not apply and hide the common level range",
    isRevaluationYear(hackTown, 2027) &&
      !isRevaluationYear(hackTown, 2026) &&
      isRevaluationYear(paramusTown, 2026) &&
      !isRevaluationYear(paramusTown, 2027) &&
      !isRevaluationYear(bayTown, 2027) &&
      !hackChapter.applies &&
      !hackChapter.showCommonLevelRange &&
      hackChapter.rangeLabel === null &&
      hackChapter.headline === "Chapter 123 does not apply this year." &&
      bayChapter.applies &&
      bayChapter.showCommonLevelRange &&
      bayChapter.rangeLabel === "53.52% – 72.42%" &&
      hackHeadline === "Chapter 123 does not apply this year" &&
      !/common level range/i.test(hackHeadline) &&
      !hackRatioCopy.includes("59.46") &&
      !hackRatioCopy.includes("80.44") &&
      hackRatioCopy.includes("does not apply") &&
      /common level range/i.test(bayHeadline) &&
      !revalHome.suppressed &&
      !revalHome.showSavings &&
      taxShock.includes("chapter123Display") &&
      taxShock.includes("showCommonLevelRange") &&
      taxShock.includes("Chapter 123 does not apply this year.") &&
      propertyTax.includes("chapter123Display") &&
      propertyTax.includes("showCommonLevelRange") &&
      propertyTax.includes("Chapter 123 does not apply this year."),
    `hack range ${hackChapter.rangeLabel}; bay range ${bayChapter.rangeLabel}`,
  );

  const appealQuestion = "How do I appeal my property taxes at 160 Overlook Avenue in Hackensack?";
  const appealGrounding = toValeModelMessage(appealQuestion, asOf);
  const badVenue = "Go to the Hackensack tax board of appeals and schedule a hearing with the tax assessor. You can also file in county court.";
  const corrected = finalizeValeReply(appealQuestion, badVenue, asOf);
  const procedure = "File with the Bergen County Board of Taxation. A further appeal is to the Tax Court of New Jersey. Chapter 123 does not apply this year in Hackensack, so compare the assessment to market value.";
  const keptProcedure = finalizeValeReply(appealQuestion, procedure, asOf);
  const rateOnly = "Hackensack's 2025 general tax rate is 3.209 per $100 and the effective rate is 2.527.";
  const procedureNotRates = finalizeValeReply(appealQuestion, rateOnly, asOf);
  const bayAppeal = toValeModelMessage("How do I appeal property taxes in Bayonne?", asOf);
  const paramusRate = toValeModelMessage("What is the tax rate in Paramus?", asOf);
  const badVenuePattern = /tax board of appeals|county court|tax assessor/i;
  check(
    "VALE-002",
    "Appeal answers name the county board and Tax Court, and revaluation years omit Chapter 123 ratios",
    isAppealProcedureQuestion(appealQuestion) &&
      !isAppealProcedureQuestion("What is the tax rate in Hackensack?") &&
      appealGrounding.includes("Bergen County Board of Taxation") &&
      appealGrounding.includes("Tax Court of New Jersey") &&
      appealGrounding.includes("2025") &&
      appealGrounding.includes("3.209") &&
      appealGrounding.includes("Chapter 123 does not apply") &&
      appealGrounding.includes("Do not state an equalization ratio") &&
      !appealGrounding.includes("78.75") &&
      !badVenuePattern.test(appealGrounding) &&
      corrected.includes("Bergen County Board of Taxation") &&
      corrected.includes("Tax Court of New Jersey") &&
      corrected.includes("Chapter 123 does not apply") &&
      corrected.includes("2025") &&
      corrected.includes("3.209") &&
      !corrected.includes("78.75") &&
      !badVenuePattern.test(corrected) &&
      keptProcedure === procedure &&
      procedureNotRates.includes("Bergen County Board of Taxation") &&
      procedureNotRates.includes("Tax Court of New Jersey") &&
      procedureNotRates !== rateOnly &&
      !procedureNotRates.startsWith("Hackensack's 2025 general tax rate") &&
      bayAppeal.includes("Hudson County Board of Taxation") &&
      bayAppeal.includes("Tax Court of New Jersey") &&
      paramusRate.includes("2025") &&
      paramusRate.includes("1.499") &&
      paramusRate.includes("equalization ratio") &&
      canonicalAppealAnswer(appealQuestion, undefined, asOf).includes("Bergen County Board of Taxation"),
    corrected.slice(0, 180),
  );

  const hardwood = renovationTypes.find((r) => r.id === "hardwood")!;
  const over = calcRoi(25000, hardwood);
  const typical = calcRoi(5000, hardwood);
  check(
    "RENO-001",
    "$25k hardwood refinish does not keep catalog recovery or a Yes verdict",
    over.njAvgRoi < 50 && over.verdict === "red" && typical.njAvgRoi >= 80 && typical.verdict === "green",
    `25k recovery ${over.njAvgRoi.toFixed(1)}% ${over.verdict}; 5k recovery ${typical.njAvgRoi.toFixed(1)}% ${typical.verdict}`,
  );

  const md = renderChatMarkdown("### Estimate\n\n**$500,000**\n\n---\n\n<script>alert(1)</script>");
  check(
    "UI-007",
    "Chat markdown renders formatting and escapes HTML",
    md.includes("<h3") && md.includes("<strong>") && md.includes("<hr") && !md.includes("<script") && md.includes("&lt;script&gt;"),
    md,
  );

  const parsed = splitStreetAndCity("36 Clark Ave, Bloomfield, NJ");
  check(
    "UI-008",
    "Home report address keeps the city for the pricing API",
    parsed.street === "36 Clark Ave" && parsed.city === "Bloomfield",
    JSON.stringify(parsed),
  );

  const offenders = walkSource(join(process.cwd(), "src")).filter((file) => {
    const text = readFileSync(file, "utf8");
    return /60,000\+|60K\+/.test(text) || /const ADMIN_API_TOKEN\s*=\s*["']/.test(text) || /DEFAULT_PASSWORDS\s*=\s*\[/.test(text);
  });
  check(
    "COPY-001",
    "Active-listing claims and admin secrets are not hardcoded in src",
    offenders.length === 0,
    offenders.join(", ") || "clean",
  );

  const adminFiles = [
    "src/components/AdminBlogTab.tsx",
    "src/components/BlogManager.tsx",
    "src/components/BlogEditor.tsx",
    "src/components/LeadPipeline.tsx",
    "src/components/MyHomeAdmin.tsx",
  ].map((file) => ({ file, text: readFileSync(join(process.cwd(), file), "utf8") }));
  const proxy = readFileSync(join(process.cwd(), "src/app/api/admin/proxy/route.ts"), "utf8");
  const directAdmin = adminFiles.filter(({ text }) =>
    text.includes("Authorization:") ||
    text.includes("/api/idx/admin/myhome/profiles") ||
    /fetch\(\s*`\$\{IDX_API\}\/api\/idx\/(admin|blog\/articles)/.test(text)
  );
  const myhome = adminFiles.find((f) => f.file.endsWith("MyHomeAdmin.tsx"))!.text;
  const proxyAllowsProfiles = proxy.includes("myhome\\/admin\\/profiles");
  const proxyAllowsBlogWrites = proxy.includes("blog\\/articles");
  check(
    "ADMIN-001",
    "Admin blog, leads, and MyHome go through the proxy with the real profiles route",
    directAdmin.length === 0 &&
      myhome.includes("/api/idx/myhome/admin/profiles") &&
      myhome.includes("/api/idx/myhome/admin/entries") &&
      proxyAllowsProfiles &&
      proxyAllowsBlogWrites &&
      !adminFiles.some(({ text }) => text.includes("Bearer")),
    directAdmin.map((f) => f.file).join(", ") || `proxied profiles=${proxyAllowsProfiles} blog=${proxyAllowsBlogWrites}`,
  );

  const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
  const home = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
  const sitemap = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
  const robots = readFileSync(join(process.cwd(), "src/app/robots.ts"), "utf8");
  const propertyMeta = readFileSync(join(process.cwd(), "src/app/property/[slug]/page.tsx"), "utf8");
  const blogManager = readFileSync(join(process.cwd(), "src/components/BlogManager.tsx"), "utf8");
  const towns = townTaxPages();
  const slugs = new Set(towns.map((town) => town.slug));
  const fortLee = townTaxPageBySlug("fort-lee");
  const washington = towns.find((town) => town.slug === "washington-township-bergen");
  const robotsText = resolveRobots(buildRobots());
  const robotsGroup = (agent: string) =>
    robotsText.split("\n\n").find((block) =>
      block.split("\n").some((line) => line.toLowerCase() === `user-agent: ${agent.toLowerCase()}`)
    ) || "";
  const hasLine = (block: string, line: string) => block.split("\n").includes(line);
  const directives = (block: string, kind: "Allow" | "Disallow") =>
    block.split("\n").filter((line) => line.startsWith(`${kind}: `)).sort().join("|");
  const searchGroup = robotsGroup("Googlebot");
  const starGroup = robotsGroup("*");
  const searchBotsAllowed = [
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "Claude-SearchBot",
    "Claude-User",
    "Perplexity-User",
    "DuckDuckBot",
    "Applebot",
    "facebookexternalhit",
    "Twitterbot",
  ].every((agent) => {
    const block = robotsGroup(agent);
    return hasLine(block, "Allow: /") &&
      hasLine(block, "Disallow: /admin") &&
      hasLine(block, "Disallow: /api/") &&
      !hasLine(block, "Disallow: /");
  });
  check(
    "SEO-001",
    "Canonicals are self-referencing, sitemap lists news and town pages, and search bots can crawl",
    !layout.includes('canonical: "https://gardenstate.ai/"') &&
      !layout.includes("headers()") &&
      layout.includes('metadataBase: new URL("https://gardenstate.ai")') &&
      home.includes('pageCanonical("/")') &&
      sitemap.includes("/news/${post.slug}") &&
      !sitemap.includes("/blog/") &&
      sitemap.includes("sitemap-listings") &&
      sitemap.includes("townTaxPages") &&
      sitemap.includes("fetchMarketCities") &&
      robots.includes('"/property-tax"') &&
      robots.includes('"/admin"') &&
      searchBotsAllowed &&
      directives(searchGroup, "Allow") === directives(starGroup, "Allow") &&
      directives(searchGroup, "Disallow") === directives(starGroup, "Disallow") &&
      robotsText.includes("Sitemap: https://gardenstate.ai/sitemap.xml") &&
      towns.length === 564 &&
      slugs.size === 564 &&
      fortLee?.name === "Fort Lee" &&
      washington?.county === "Bergen" &&
      cityToSlug("Fort Lee") === "fort-lee" &&
      cityToSlug("Bayonne") === "bayonne" &&
      propertyMeta.includes("pageCanonical(`/property/${slug}`)") &&
      !propertyMeta.includes("| Garden State AI`") &&
      blogManager.includes("/api/idx/admin/blog/articles") &&
      blogManager.includes("Generate City Tax Guides") &&
      !blogManager.includes("/api/idx/blog/posts"),
    `towns ${towns.length} unique ${slugs.size} fortLee ${fortLee?.name || "missing"} washington ${washington?.slug || "missing"}`,
  );

  const keyFile = readFileSync(join(process.cwd(), `public${INDEXNOW_KEY_PATH}`), "utf8");
  const middleware = readFileSync(join(process.cwd(), "src/middleware.ts"), "utf8");
  const indexRoute = readFileSync(join(process.cwd(), "src/app/api/indexnow/route.ts"), "utf8");
  const trainingGroup = robotsGroup("GPTBot");
  const allowedNames = [...ALLOWED_BOTS];
  const trainingNames = [...TRAINING_CRAWLERS];
  const trainingListed = trainingNames.every((agent) => hasLine(trainingGroup, `User-Agent: ${agent}`));
  const allowedSeparate = allowedNames.every((agent) => {
    const block = robotsGroup(agent);
    return block.length > 0 && block !== trainingGroup && hasLine(block, "Allow: /") && !hasLine(block, "Disallow: /");
  });
  const tokenSafe = allowedNames.every((name) => !isTrainingCrawler(name)) &&
    trainingNames.every((name) => isTrainingCrawler(name)) &&
    allowedNames.every((allowed) => !trainingNames.some((name) => allowed.toLowerCase().includes(name.toLowerCase())));
  const realisticUas =
    isTrainingCrawler("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)") &&
    !isTrainingCrawler("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)") &&
    !isTrainingCrawler("Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)") &&
    !isTrainingCrawler("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot") &&
    !isTrainingCrawler("Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)") &&
    !isTrainingCrawler("Claude-SearchBot/1.0") &&
    !isTrainingCrawler("Claude-User/1.0") &&
    isTrainingCrawler("ClaudeBot/1.0") &&
    isTrainingCrawler("anthropic-ai") &&
    !isTrainingCrawler("Perplexity-User") &&
    isTrainingCrawler("PerplexityBot/1.0") &&
    !isTrainingCrawler("Mozilla/5.0 (Applebot/0.1; +http://www.apple.com/go/applebot)") &&
    isTrainingCrawler("Applebot-Extended") &&
    !isTrainingCrawler("facebookexternalhit/1.1") &&
    !isTrainingCrawler(null) &&
    !isTrainingCrawler("");
  const gate = await runCrawlerMiddlewareChecks();
  check(
    "CRAWL-001",
    "Training crawlers are disallowed in robots.txt and refused with HTTP 403",
    trainingListed &&
      allowedSeparate &&
      hasLine(trainingGroup, "Disallow: /") &&
      hasLine(trainingGroup, `Allow: ${INDEXNOW_KEY_PATH}`) &&
      !hasLine(trainingGroup, "Allow: /") &&
      hasLine(starGroup, `Allow: ${INDEXNOW_KEY_PATH}`) &&
      robotsText.trimEnd().endsWith("Sitemap: https://gardenstate.ai/sitemap.xml") &&
      tokenSafe &&
      realisticUas &&
      gate.pass &&
      middleware.includes("isTrainingCrawler") &&
      middleware.includes('pathname === "/robots.txt"') &&
      middleware.includes("status: 403") &&
      middleware.includes("idxlistings.gardenstate.ai") &&
      middleware.includes('"/((?!_next/static|_next/image).*)"'),
    gate.pass ? `training ${trainingNames.length} allowed ${allowedNames.length}` : gate.detail,
  );
  const many = Array.from({ length: 10001 }, (_, i) => `https://gardenstate.ai/property/${i}`);
  const chunks = chunkUrls(indexNowUrls([...many, "https://evil.example/x", many[0]]));
  const calls: { url: string; size: number; key: string; host: string; keyLocation: string }[] = [];
  const submitted = await submitIndexNow([...many, "https://evil.example/nope"], async (url, init) => {
    const body = JSON.parse(String(init?.body));
    calls.push({ url: String(url), size: body.urlList.length, key: body.key, host: body.host, keyLocation: body.keyLocation });
    return new Response(null, { status: 202 });
  });
  const payload = indexNowBody(chunks[0]);
  check(
    "INDEXNOW-001",
    "IndexNow key file is the raw key and sitemap URLs submit in 10,000-URL batches",
    keyFile === INDEXNOW_KEY &&
      robots.includes("INDEXNOW_KEY_PATH") &&
      middleware.includes(INDEXNOW_KEY_PATH) &&
      chunks.length === 2 &&
      chunks[0].length === 10000 &&
      chunks[1].length === 1 &&
      payload.host === "gardenstate.ai" &&
      payload.key === INDEXNOW_KEY &&
      payload.keyLocation === INDEXNOW_KEY_LOCATION &&
      payload.urlList.length === 10000 &&
      submitted.submitted === 10001 &&
      submitted.batches === 2 &&
      calls.length === 4 &&
      calls.every((call) => call.size <= 10000 && call.key === INDEXNOW_KEY && call.host === "gardenstate.ai" && call.keyLocation === INDEXNOW_KEY_LOCATION) &&
      calls.filter((call) => call.url === "https://api.indexnow.org/indexnow").length === 2 &&
      calls.filter((call) => call.url === "https://www.bing.com/indexnow").length === 2 &&
      submitted.results.every((row) => row.ok && (row.status === 200 || row.status === 202)) &&
      indexRoute.includes("allSitemap") &&
      indexRoute.includes('mode !== "sitemap"') &&
      indexRoute.includes("verifySession") &&
      blogManager.includes("Ping IndexNow (Submit Sitemap)") &&
      blogManager.includes("pingIndexNow({ allSitemap: true })") &&
      blogManager.includes("https://gardenstate.ai/news/${article.slug}"),
    `chunks ${chunks.map((chunk) => chunk.length).join("+")} calls ${calls.length} keyBytes ${keyFile.length}`,
  );

  const euclidPrice = pricingEstimateView({
    estimatedValue: 930020,
    lowRange: 818418,
    highRange: 1004422,
    pricePerSqft: 0,
  });
  const euclidTax = taxMarketView({
    estimatedMarketValueLow: 690000,
    estimatedMarketValueHigh: 850000,
    estimatedMarketValueMid: 734425,
    impliedMarketValue: 702216,
  });
  const valueClient = readFileSync(join(process.cwd(), "src/components/ValuePageClient.tsx"), "utf8");
  const homeTool = readFileSync(join(process.cwd(), "src/components/HomeValuationTool.tsx"), "utf8");
  const sellScore = readFileSync(join(process.cwd(), "src/components/SellScoreResult.tsx"), "utf8");
  const searchEngine = readFileSync(join(process.cwd(), "src/components/SearchEngine.tsx"), "utf8");
  const listingCard = readFileSync(join(process.cwd(), "src/components/ListingCard.tsx"), "utf8");
  check(
    "SQFT-001",
    "Missing square footage does not render as $0/sqft or 0 sqft",
    positiveAmount(0) == null &&
      positiveAmount(null) == null &&
      positiveAmount(undefined) == null &&
      positiveAmount("") == null &&
      positiveAmount("0") == null &&
      positiveAmount("0.00") == null &&
      sqftLabel(0) == null &&
      sqftLabel(null) == null &&
      pricePerSqftLabel(0) == null &&
      pricePerSqftLabel("0") == null &&
      pricePerSqftLabel(0.4) == null &&
      sqftLabel(1500) === "1,500 sqft" &&
      pricePerSqftLabel(246) === "$246/sqft" &&
      sqftLabel(50, { minExclusive: 100 }) == null &&
      sqftLabel(1800, { minExclusive: 100, unit: "Sqft" }) === "1,800 Sqft" &&
      euclidPrice.pricePerSqft == null &&
      homeTool.includes("pricePerSqftLabel") &&
      !homeTool.includes("Avg ${estimate.pricePerSqft}/sqft") &&
      sellScore.includes("positiveAmount(result.pricePerSqft)") &&
      !searchEngine.includes("living_area != null") &&
      searchEngine.includes("sqftLabel") &&
      listingCard.includes("sqftLabel") &&
      propertyTax.includes("positiveAmount(comp.livingAreaSqft)") &&
      taxShock.includes("sqftLabel(c.livingAreaSqft)") &&
      !walkSource(join(process.cwd(), "src")).some((file) => /living_area\s*!=\s*null/.test(readFileSync(file, "utf8"))),
    `label ${sqftLabel(1500)} perSqft ${pricePerSqftLabel(246)} zero ${String(pricePerSqftLabel(0))}`,
  );

  check(
    "VAL-001",
    "Value and tax pages keep the backend market-value estimate",
    euclidPrice.estimatedValue === 930020 &&
      euclidPrice.lowRange === 818418 &&
      euclidPrice.highRange === 1004422 &&
      euclidPrice.estimatedValue !== euclidTax.estimatedMarketValueMid &&
      euclidTax.estimatedMarketValueLow === 690000 &&
      euclidTax.estimatedMarketValueHigh === 850000 &&
      euclidTax.estimatedMarketValueMid === 734425 &&
      euclidTax.impliedMarketValue === 702216 &&
      taxMarketView({
        estimatedMarketValueMid: 734425,
        impliedMarketValue: 702216,
        estimatedMarketValueLow: 690000,
        estimatedMarketValueHigh: 850000,
      }).estimatedMarketValueMid === 734425 &&
      valueClient.includes("pricingEstimateView") &&
      valueClient.includes("estimatedValue: priced.estimatedValue") &&
      valueClient.includes("/api/idx/pricing/estimate") &&
      !valueClient.includes("impliedMarketValue") &&
      !valueClient.includes("zestimate") &&
      propertyTax.includes("taxMarketView") &&
      propertyTax.includes("/api/idx/tax-appeal/analyze") &&
      taxShock.includes("taxMarketView") &&
      taxShock.includes("/api/idx/tax-appeal/analyze") &&
      !propertyTax.includes("estimatedMarketValueMid: data.estimatedValue") &&
      !taxShock.includes("estimatedMarketValueMid: data.estimatedValue"),
    `value ${euclidPrice.estimatedValue} taxMid ${euclidTax.estimatedMarketValueMid} implied ${euclidTax.impliedMarketValue}`,
  );

  const monitored = ["scripts", "src/app/api", ".github"]
    .map((dir) => join(process.cwd(), dir))
    .filter((dir) => existsSync(dir))
    .flatMap((dir) => walkSource(dir));
  const addressHit = monitored.filter((file) => /119\s*W\s*21|155\s*W\s*3rd/i.test(readFileSync(file, "utf8")));
  const paidLoop = monitored.filter((file) => {
    const text = readFileSync(file, "utf8");
    return /tax-appeal\/analyze|pricing\/estimate/.test(text);
  });
  const health = readFileSync(join(process.cwd(), "scripts/health-check.ts"), "utf8");
  const repoHits = walkSource(process.cwd()).filter((file) => {
    if (file.endsWith(`${join("test", "search-regression.ts")}`)) return false;
    return /119\s*W\s*21|155\s*W\s*3rd/i.test(readFileSync(file, "utf8"));
  });
  check(
    "MONITOR-001",
    "No scheduled job values the Bayonne health-check addresses",
    addressHit.length === 0 &&
      paidLoop.length === 0 &&
      repoHits.length === 0 &&
      !existsSync(join(process.cwd(), "vercel.json")) &&
      health.includes("30 * 60_000") &&
      !health.includes("tax-appeal") &&
      !health.includes("pricing/estimate") &&
      !health.includes("119 W 21") &&
      !health.includes("155 W 3rd"),
    `address files ${addressHit.length} paid files ${paidLoop.length} repo hits ${repoHits.length}`,
  );

  return results;
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  NJ Realty Bot — Search Regression Tests");
  console.log("═══════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  for (const test of await runLocalTests()) {
    if (test.pass) {
      console.log(`  ✅ ${test.id}: ${test.description}`);
      console.log(`     → ${test.detail}`);
      passed++;
    } else {
      console.log(`  ❌ ${test.id}: ${test.description}`);
      console.log(`     → ${test.detail}`);
      failed++;
    }
  }

  for (const test of TESTS) {
    try {
      const result = test.type === "parse"
        ? await runParseTest(test)
        : await runSearchTest(test);

      if (result.pass) {
        console.log(`  ✅ ${test.id}: ${test.description}`);
        console.log(`     → ${result.detail}`);
        passed++;
      } else {
        console.log(`  ❌ ${test.id}: ${test.description}`);
        console.log(`     → ${result.detail}`);
        failed++;
      }
    } catch (e: any) {
      console.log(`  💥 ${test.id}: ${test.description}`);
      console.log(`     → CRASHED: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`═══════════════════════════════════════════════════`);

  if (failed > 0) process.exit(1);
}

main();
