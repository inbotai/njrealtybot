/**
 * Unit tests for Chapter 123 Property Tax Overpayment Calculator
 *
 * Run: npx tsx src/lib/service-ladder/property-tax/calc.test.ts
 *
 * Three scenarios:
 *   1. Overpaying — assessment too high relative to comps
 *   2. Fairly assessed — assessment within common level range
 *   3. Under-assessed — assessment below market (no appeal benefit)
 */

import { analyzePropertyTax } from "./calc";
import { MockProvider } from "./data-provider";
import type { PropertyAssessment, ComparableSale } from "./types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

// ── Scenario 1: Overpaying (Montclair) ─────────────────────────

async function testOverpaying() {
  console.log("\n--- Scenario 1: Overpaying (123 Maple St, Montclair) ---");
  const provider = new MockProvider();
  const assessment = await provider.getAssessment("123 maple st, montclair, nj");
  const comps = await provider.getComparableSales("123 maple st, montclair, nj");
  const ratio = await provider.getDirectorRatio("Essex");

  assert(assessment !== null, "Assessment found");
  assert(comps.length >= 3, `Got ${comps.length} comps`);
  assert(ratio !== null, "Director ratio found");

  const result = analyzePropertyTax(assessment!, comps, ratio!);

  assert(result.isOverAssessed === true, "Property is over-assessed");
  assert(result.overpaymentHigh > 0, `Overpayment high: $${result.overpaymentHigh}`);
  assert(result.overpaymentLow >= 0, `Overpayment low: $${result.overpaymentLow}`);
  assert(result.overpaymentHigh >= result.overpaymentLow, "High >= Low");
  assert(
    result.appealLikelihood === "high" || result.appealLikelihood === "moderate",
    `Appeal likelihood: ${result.appealLikelihood}`,
  );
  assert(result.comparables.length === comps.length, "Comps passed through");
  assert(result.filingDeadline.includes("April 1"), `Deadline: ${result.filingDeadline}`);
  assert(result.directorRatio === ratio!, "Director ratio preserved");
  assert(result.commonLevelRangeLow < result.directorRatio, "CLR low < ratio");
  assert(result.commonLevelRangeHigh > result.directorRatio, "CLR high > ratio");
}

// ── Scenario 2: Fairly Assessed (Bloomfield) ──────────────────

async function testFairlyAssessed() {
  console.log("\n--- Scenario 2: Fairly Assessed (456 Broad St, Bloomfield) ---");
  const provider = new MockProvider();
  const assessment = await provider.getAssessment("456 broad st, bloomfield, nj");
  const comps = await provider.getComparableSales("456 broad st, bloomfield, nj");
  const ratio = await provider.getDirectorRatio("Essex");

  const result = analyzePropertyTax(assessment!, comps, ratio!);

  // Bloomfield: assessed at 320k, comps avg ~382k, ratio 0.8234
  // Fair assessment = 382k * 0.8234 = ~314k. Current 320k is close.
  assert(result.isOverAssessed === false, "Property is NOT over-assessed");
  assert(
    result.overpaymentHigh < 1000,
    `Low overpayment range: $${result.overpaymentHigh}`,
  );
  assert(
    result.appealLikelihood === "low" || result.appealLikelihood === "moderate",
    `Appeal likelihood: ${result.appealLikelihood}`,
  );
}

// ── Scenario 3: Under-Assessed (Edgewater) ────────────────────

async function testUnderAssessed() {
  console.log("\n--- Scenario 3: Under-Assessed (789 River Rd, Edgewater) ---");
  const provider = new MockProvider();
  const assessment = await provider.getAssessment("789 river rd, edgewater, nj");
  const comps = await provider.getComparableSales("789 river rd, edgewater, nj");
  const ratio = await provider.getDirectorRatio("Bergen");

  const result = analyzePropertyTax(assessment!, comps, ratio!);

  // Edgewater: assessed at 350k, comps avg ~518k, ratio 0.9789
  // Fair assessment = 518k * 0.9789 = ~507k. Current 350k is BELOW fair.
  assert(result.isOverAssessed === false, "Property is NOT over-assessed");
  assert(result.overpaymentLow === 0, "No overpayment (low)");
  assert(result.overpaymentHigh === 0, "No overpayment (high)");
  assert(result.appealLikelihood === "low", `Appeal likelihood: ${result.appealLikelihood}`);
  assert(
    result.impliedMarketValue < result.estimatedMarketValueMid,
    "Implied value < market value (under-assessed)",
  );
}

// ── Run ────────────────────────────────────────────────────────

async function main() {
  console.log("Property Tax Calc — Unit Tests");
  console.log("==============================");

  await testOverpaying();
  await testFairlyAssessed();
  await testUnderAssessed();

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
