#!/usr/bin/env npx tsx
/**
 * gardenstate.ai — Automated Health Check & Regression Suite
 *
 * Tests all endpoints, validates data quality, compares with Zillow baselines.
 * Run: npx tsx scripts/health-check.ts
 * Loop: npx tsx scripts/health-check.ts --loop (runs every 30 min)
 *
 * Exit code 0 = all pass, 1 = failures found
 */

const API = process.env.IDX_API || "https://inbot-idx-api-production.up.railway.app";
const LOOP = process.argv.includes("--loop");
const INTERVAL = 30 * 60_000; // 30 minutes

interface TestResult {
  name: string;
  pass: boolean;
  detail: string;
  category: string;
}

const results: TestResult[] = [];

function test(name: string, category: string, pass: boolean, detail: string) {
  results.push({ name, category, pass, detail });
  const icon = pass ? "✅" : "❌";
  console.log(`${icon} [${category}] ${name}: ${detail}`);
}

async function fetchJson(url: string): Promise<any> {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function postJson(url: string, body: any): Promise<any> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  return r.json();
}

// ═══════════════════════════════════════════════════════
// SEARCH TESTS
// ═══════════════════════════════════════════════════════
async function testSearch() {
  // Active listings by city
  try {
    const d = await fetchJson(`${API}/api/idx/listings?city=Paramus&status=Active&limit=1`);
    test("Search active by city", "search", d.total > 10, `total=${d.total}`);
  } catch (e: any) { test("Search active by city", "search", false, e.message); }

  // Sold listings
  try {
    const d = await fetchJson(`${API}/api/idx/listings?city=Paramus&status=Sold&limit=1`);
    test("Search sold by city", "search", d.total > 50, `total=${d.total}`);
  } catch (e: any) { test("Search sold by city", "search", false, e.message); }

  // ZIP code search
  try {
    const d = await fetchJson(`${API}/api/idx/listings?postalCode=07652&limit=1`);
    test("Search by ZIP code", "search", d.total > 5, `total=${d.total}`);
  } catch (e: any) { test("Search by ZIP code", "search", false, e.message); }

  // Address search (abbreviated)
  try {
    const d = await fetchJson(`${API}/api/idx/listings?q=1+sheba+dr&status=all&limit=1`);
    test("Address search (abbreviated)", "search", d.total >= 1, `total=${d.total}`);
  } catch (e: any) { test("Address search (abbreviated)", "search", false, e.message); }

  // Address search (full street name — tests normalization)
  try {
    const d = await fetchJson(`${API}/api/idx/listings?q=1+sheba+drive&status=all&limit=1`);
    test("Address search (full name)", "search", d.total >= 1, `total=${d.total}`);
  } catch (e: any) { test("Address search (full name)", "search", false, e.message); }

  // County + price + beds filter
  try {
    const d = await fetchJson(`${API}/api/idx/listings?county=Bergen&minPrice=500000&maxPrice=800000&beds=3&limit=1`);
    test("County+price+beds filter", "search", d.total > 5, `total=${d.total}`);
  } catch (e: any) { test("County+price+beds filter", "search", false, e.message); }

  // All statuses
  try {
    const d = await fetchJson(`${API}/api/idx/listings?status=all&limit=1`);
    test("All statuses search", "search", d.total > 1000, `total=${d.total}`);
  } catch (e: any) { test("All statuses search", "search", false, e.message); }

  // Listing detail
  try {
    const search = await fetchJson(`${API}/api/idx/listings?city=Paramus&limit=1`);
    if (search.listings?.[0]) {
      const det = await fetchJson(`${API}/api/idx/listings/${search.listings[0].id}`);
      const l = det.listing;
      test("Listing detail", "search",
        !!l.unparsed_address && !!l.list_price && l.photo_count >= 0,
        `addr=${l.unparsed_address} price=$${l.list_price?.toLocaleString()}`);
    }
  } catch (e: any) { test("Listing detail", "search", false, e.message); }
}

// ═══════════════════════════════════════════════════════
// AUTOCOMPLETE
// ═══════════════════════════════════════════════════════
async function testAutocomplete() {
  try {
    const d = await fetchJson(`${API}/api/idx/autocomplete?q=Par`);
    test("Autocomplete city", "autocomplete", d.results?.length > 0, `results=${d.results?.length}`);
  } catch (e: any) { test("Autocomplete city", "autocomplete", false, e.message); }

  try {
    const d = await fetchJson(`${API}/api/idx/autocomplete?q=076`);
    test("Autocomplete ZIP", "autocomplete", d.results?.length > 0, `results=${d.results?.length}`);
  } catch (e: any) { test("Autocomplete ZIP", "autocomplete", false, e.message); }
}

// ═══════════════════════════════════════════════════════
// MARKET REPORTS
// ═══════════════════════════════════════════════════════
async function testMarketReports() {
  const cities = ["Paramus", "Clifton", "Wayne", "Montclair"];

  for (const city of cities) {
    try {
      const d = await fetchJson(`${API}/api/idx/market/${city}`);
      const s = d.stats || {};
      const inv = d.investment || {};

      test(`Market ${city} — has data`, "market",
        s.activeCount > 0 && s.soldCount > 0,
        `active=${s.activeCount} sold=${s.soldCount}`);

      test(`Market ${city} — prices reasonable`, "market",
        s.medianSoldPrice > 100000 && s.medianSoldPrice < 5000000,
        `median=$${s.medianSoldPrice?.toLocaleString()}`);

      test(`Market ${city} — has investment data`, "market",
        inv.investScore > 0 && inv.avgTax > 0,
        `score=${inv.investScore} tax=$${inv.avgTax?.toLocaleString()}`);

      test(`Market ${city} — appreciation realistic`, "market",
        inv.appreciation >= -5 && inv.appreciation <= 15,
        `appreciation=${inv.appreciation}%`);
    } catch (e: any) { test(`Market ${city}`, "market", false, e.message); }
  }

  // Market cities count
  try {
    const d = await fetchJson(`${API}/api/idx/market-cities`);
    test("Market cities list", "market", d.cities?.length > 100, `cities=${d.cities?.length} total=${d._total}`);
  } catch (e: any) { test("Market cities list", "market", false, e.message); }
}

// ═══════════════════════════════════════════════════════
// AI PARSE SEARCH
// ═══════════════════════════════════════════════════════
async function testParseSearch() {
  const cases = [
    { q: "3 bedroom house in Paramus under 800k", expect: { city: "Paramus", beds: 3, maxPrice: 800000 } },
    { q: "condos in Hoboken", expect: { city: "Hoboken" } },
    { q: "casas en Clifton menos de 500 mil", expect: { city: "Clifton", maxPrice: 500000 } },
  ];

  for (const c of cases) {
    try {
      const d = await postJson(`${API}/api/idx/parse-search`, { q: c.q });
      const checks = Object.entries(c.expect).map(([k, v]) => {
        if (k === "city") return (d.city || "").toLowerCase() === (v as string).toLowerCase();
        return d[k] === v;
      });
      test(`Parse: "${c.q}"`, "ai-parse", checks.every(Boolean), JSON.stringify(d));
    } catch (e: any) { test(`Parse: "${c.q}"`, "ai-parse", false, e.message); }
  }
}

// ═══════════════════════════════════════════════════════
// OPEN HOUSES
// ═══════════════════════════════════════════════════════
async function testOpenHouses() {
  try {
    const d = await fetchJson(`${API}/api/idx/open-houses`);
    test("Open houses endpoint", "open-houses", Array.isArray(d.openHouses), `count=${d.openHouses?.length}`);
  } catch (e: any) { test("Open houses endpoint", "open-houses", false, e.message); }
}

// ═══════════════════════════════════════════════════════
// GSMLS COMPLIANCE
// ═══════════════════════════════════════════════════════
async function testGsmlsCompliance() {
  try {
    // Search all GSMLS listings (source ID)
    const d = await fetchJson(`${API}/api/idx/listings?status=all&limit=50`);
    const gsmlsId = "e09b0ae1-6b61-401d-a5ee-2fa79d473f3e";
    const gsmlsListings = (d.listings || []).filter((l: any) => l.mls_source_id === gsmlsId);
    const nonGreenTeam = gsmlsListings.filter((l: any) =>
      !(l.listing_office_name || "").toLowerCase().includes("green team"));

    test("GSMLS compliance — no non-Green Team", "compliance",
      nonGreenTeam.length === 0,
      `gsmls_in_results=${gsmlsListings.length} non_green_team=${nonGreenTeam.length}`);
  } catch (e: any) { test("GSMLS compliance", "compliance", false, e.message); }
}

// ═══════════════════════════════════════════════════════
// SOLD LISTING DETAILS
// ═══════════════════════════════════════════════════════
async function testSoldDetails() {
  try {
    const d = await fetchJson(`${API}/api/idx/listings?status=Sold&limit=5`);
    const withClosePrice = (d.listings || []).filter((l: any) => l.close_price);
    test("Sold listings have close_price", "sold",
      withClosePrice.length > 0,
      `${withClosePrice.length}/${d.listings?.length} have close_price`);
  } catch (e: any) { test("Sold listings details", "sold", false, e.message); }
}

// ═══════════════════════════════════════════════════════
// ZILLOW COMPARISON BASELINES
// ═══════════════════════════════════════════════════════
async function testZillowBaselines() {
  // Approximate Zillow typical home values as of mid-2026
  // Updated periodically to track divergence
  const baselines: Record<string, number> = {
    Paramus: 750000,
    Clifton: 530000,
    Wayne: 600000,
  };

  for (const [city, zillowTypical] of Object.entries(baselines)) {
    try {
      const d = await fetchJson(`${API}/api/idx/market/${city}`);
      const median = d.stats?.medianSoldPrice || 0;
      const diff = Math.abs(median - zillowTypical) / zillowTypical * 100;

      // Allow 40% divergence (our data = recent sales only, Zillow = all homes)
      test(`Zillow baseline ${city}`, "zillow",
        diff < 40,
        `ours=$${median.toLocaleString()} zillow=~$${zillowTypical.toLocaleString()} diff=${diff.toFixed(0)}%`);
    } catch (e: any) { test(`Zillow baseline ${city}`, "zillow", false, e.message); }
  }
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════
async function runAll() {
  results.length = 0;
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  gardenstate.ai Health Check — ${new Date().toISOString()}`);
  console.log(`  API: ${API}`);
  console.log(`${"═".repeat(60)}\n`);

  await testSearch();
  await testAutocomplete();
  await testMarketReports();
  await testParseSearch();
  await testOpenHouses();
  await testGsmlsCompliance();
  await testSoldDetails();
  await testZillowBaselines();

  // Summary
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;

  console.log(`\n${"─".repeat(60)}`);
  console.log(`  RESULTS: ${passed}/${total} passed, ${failed} failed`);
  if (failed > 0) {
    console.log(`\n  FAILURES:`);
    results.filter(r => !r.pass).forEach(r =>
      console.log(`    ❌ [${r.category}] ${r.name}: ${r.detail}`));
  }
  console.log(`${"─".repeat(60)}\n`);

  return failed === 0;
}

async function main() {
  if (LOOP) {
    console.log(`Running in loop mode (every ${INTERVAL / 60000} minutes)...`);
    while (true) {
      await runAll();
      console.log(`Next run in ${INTERVAL / 60000} minutes...\n`);
      await new Promise(r => setTimeout(r, INTERVAL));
    }
  } else {
    const ok = await runAll();
    process.exit(ok ? 0 : 1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
