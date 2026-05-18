/**
 * Full Simulation Tests — njrealtybot
 *
 * Tests the entire pipeline: parse-search + listings API + chat engine.
 * Simulates real user queries in English, Spanish, and voice-style input.
 *
 * Run: npx tsx test/full-simulation.ts
 */

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface TestCase {
  id: string;
  category: string;
  input: string;
  expectType: "search" | "chat" | "cma";
  expectParse?: Record<string, any>;
  expectMinResults?: number;
}

const TESTS: TestCase[] = [
  // ══════════════════════════════════════════════════
  // PROPERTY SEARCH — By City
  // ══════════════════════════════════════════════════
  { id: "S-CITY-01", category: "Search by City", input: "homes in Hoboken", expectType: "search", expectParse: { city: "Hoboken" }, expectMinResults: 1 },
  { id: "S-CITY-02", category: "Search by City", input: "casas en Paramus", expectType: "search", expectParse: { city: "Paramus" }, expectMinResults: 1 },
  { id: "S-CITY-03", category: "Search by City", input: "houses for sale in Wayne", expectType: "search", expectParse: { city: "Wayne" }, expectMinResults: 1 },
  { id: "S-CITY-04", category: "Search by City", input: "propiedades en Clifton", expectType: "search", expectParse: { city: "Clifton" }, expectMinResults: 1 },
  { id: "S-CITY-05", category: "Search by City", input: "listings in Jersey City", expectType: "search", expectParse: { city: "Jersey City" }, expectMinResults: 1 },

  // ══════════════════════════════════════════════════
  // PROPERTY SEARCH — By Price
  // ══════════════════════════════════════════════════
  { id: "S-PRICE-01", category: "Search by Price", input: "homes under 300k", expectType: "search", expectParse: { maxPrice: 300000 }, expectMinResults: 1 },
  { id: "S-PRICE-02", category: "Search by Price", input: "casas de menos de 200 mil dolares", expectType: "search", expectParse: { maxPrice: 200000 }, expectMinResults: 1 },
  { id: "S-PRICE-03", category: "Search by Price", input: "houses between 400k and 600k in Montclair", expectType: "search", expectParse: { city: "Montclair", minPrice: 400000, maxPrice: 600000 } },
  { id: "S-PRICE-04", category: "Search by Price", input: "propiedades de menos de medio millon", expectType: "search", expectParse: { maxPrice: 500000 }, expectMinResults: 1 },
  { id: "S-PRICE-05", category: "Search by Price", input: "homes over 1 million in Alpine", expectType: "search", expectParse: { city: "Alpine", minPrice: 1000000 } },

  // ══════════════════════════════════════════════════
  // PROPERTY SEARCH — By Bedrooms
  // ══════════════════════════════════════════════════
  { id: "S-BEDS-01", category: "Search by Beds", input: "3 bedroom homes in Bloomfield", expectType: "search", expectParse: { city: "Bloomfield", beds: 3 }, expectMinResults: 1 },
  { id: "S-BEDS-02", category: "Search by Beds", input: "2 dormitorios en Paramus", expectType: "search", expectParse: { city: "Paramus", beds: 2 }, expectMinResults: 1 },
  { id: "S-BEDS-03", category: "Search by Beds", input: "4 bed 2 bath in Fort Lee", expectType: "search", expectParse: { city: "Fort Lee", beds: 4, baths: 2 } },
  { id: "S-BEDS-04", category: "Search by Beds", input: "5 bedroom house under 800k", expectType: "search", expectParse: { beds: 5, maxPrice: 800000 } },

  // ══════════════════════════════════════════════════
  // PROPERTY SEARCH — By County
  // ══════════════════════════════════════════════════
  { id: "S-COUNTY-01", category: "Search by County", input: "homes in Bergen County", expectType: "search", expectParse: { county: "Bergen" }, expectMinResults: 1 },
  { id: "S-COUNTY-02", category: "Search by County", input: "casas en Morris County de menos de 500k", expectType: "search", expectParse: { county: "Morris", maxPrice: 500000 } },
  { id: "S-COUNTY-03", category: "Search by County", input: "multi family in Essex County", expectType: "search", expectParse: { county: "Essex" } },
  { id: "S-COUNTY-04", category: "Search by County", input: "land for sale in Sussex County", expectType: "search", expectParse: { county: "Sussex" } },

  // ══════════════════════════════════════════════════
  // PROPERTY SEARCH — By Type (Rental, Commercial, Land)
  // ══════════════════════════════════════════════════
  { id: "S-TYPE-01", category: "Search by Type", input: "rental apartments in Union City", expectType: "search", expectParse: { city: "Union City", propertyType: "Rental" } },
  { id: "S-TYPE-02", category: "Search by Type", input: "commercial property in Hackensack", expectType: "search", expectParse: { city: "Hackensack", propertyType: "Commercial" } },
  { id: "S-TYPE-03", category: "Search by Type", input: "terrenos en venta en Sussex", expectType: "search", expectParse: { propertyType: "Land" } },
  { id: "S-TYPE-04", category: "Search by Type", input: "multifamily in Elmwood Park", expectType: "search", expectParse: { city: "Elmwood Park" } },

  // ══════════════════════════════════════════════════
  // PROPERTY SEARCH — Near NYC / Train
  // ══════════════════════════════════════════════════
  { id: "S-NYC-01", category: "Near NYC", input: "homes near New York City under 500k", expectType: "search", expectParse: { maxPrice: 500000 } },
  { id: "S-NYC-02", category: "Near NYC", input: "casas cerca del tren a Nueva York", expectType: "search" },
  { id: "S-NYC-03", category: "Near NYC", input: "homes near NJ Transit in Bergen County", expectType: "search", expectParse: { county: "Bergen" } },
  { id: "S-NYC-04", category: "Near NYC", input: "waterfront homes in Hudson County", expectType: "search", expectParse: { county: "Hudson" } },

  // ══════════════════════════════════════════════════
  // PROPERTY SEARCH — Features
  // ══════════════════════════════════════════════════
  { id: "S-FEAT-01", category: "Features", input: "house with pool in Wayne", expectType: "search", expectParse: { city: "Wayne" } },
  { id: "S-FEAT-02", category: "Features", input: "casa con garage en Clifton", expectType: "search", expectParse: { city: "Clifton" } },
  { id: "S-FEAT-03", category: "Features", input: "lakefront property in Vernon", expectType: "search", expectParse: { city: "Vernon" } },

  // ══════════════════════════════════════════════════
  // CMA / MARKET ANALYSIS
  // ══════════════════════════════════════════════════
  { id: "CMA-01", category: "CMA", input: "CMA for 36 Clark Avenue Bloomfield", expectType: "cma" },
  { id: "CMA-02", category: "CMA", input: "market analysis for 8 Saturn Court Vernon NJ", expectType: "cma" },
  { id: "CMA-03", category: "CMA", input: "cuanto vale mi casa en 123 Main St Hackensack", expectType: "cma" },
  { id: "CMA-04", category: "CMA", input: "how much is my home worth at 45 Oak Street Montclair", expectType: "cma" },
  { id: "CMA-05", category: "CMA", input: "analisis de mercado para 37 Summit Avenue Elmwood Park", expectType: "cma" },
  { id: "CMA-06", category: "CMA", input: "I want to sell my house at 200 Broad St Bloomfield", expectType: "cma" },

  // ══════════════════════════════════════════════════
  // GENERAL QUESTIONS → Chat
  // ══════════════════════════════════════════════════
  { id: "Q-01", category: "General Questions", input: "can I buy a house without an agent", expectType: "chat" },
  { id: "Q-02", category: "General Questions", input: "what do I need to buy my first home", expectType: "chat" },
  { id: "Q-03", category: "General Questions", input: "como puedo comprar una casa sin agente", expectType: "chat" },
  { id: "Q-04", category: "General Questions", input: "what is a good neighborhood for families", expectType: "chat" },
  { id: "Q-05", category: "General Questions", input: "cuales son los requisitos para comprar casa", expectType: "chat" },

  // ══════════════════════════════════════════════════
  // VOICE-STYLE (speech-to-text corrupted)
  // ══════════════════════════════════════════════════
  { id: "V-01", category: "Voice STT", input: "homes under two hundred thousand in clifton", expectType: "search", expectParse: { city: "Clifton", maxPrice: 200000 } },
  { id: "V-02", category: "Voice STT", input: "busco casa de tres dormitorios en paramus", expectType: "search", expectParse: { city: "Paramus", beds: 3 } },
  { id: "V-03", category: "Voice STT", input: "Dominos CMA para treinta is Clark Avenue in Bloomfield", expectType: "cma" },
  { id: "V-04", category: "Voice STT", input: "necesito un análisis de mercado para mi propiedad", expectType: "cma" },
  { id: "V-05", category: "Voice STT", input: "I need a three bedroom home in hoboken under five hundred thousand", expectType: "search", expectParse: { city: "Hoboken", beds: 3, maxPrice: 500000 } },
];

// ── CMA detection (mirrors hero logic) ─────────────────────────
function isCMA(q: string): boolean {
  const norm = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /worth|value|valuation|sell|vender|cma|cuanto vale|market analysis|analisis de mercado|how much/i.test(norm);
}

// ── Runner ─────────────────────────────────────────────────────

async function runTest(test: TestCase): Promise<{ pass: boolean; detail: string }> {
  const failures: string[] = [];

  // 1. Check CMA detection
  if (test.expectType === "cma") {
    if (!isCMA(test.input)) {
      failures.push(`Should be detected as CMA but regex didn't match`);
    }
    return { pass: failures.length === 0, detail: failures.join("; ") || "CMA detected" };
  }

  // 2. Check general questions (should have no search params)
  if (test.expectType === "chat") {
    const res = await fetch(`${IDX_API}/api/idx/parse-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: test.input }),
    });
    const parsed = await res.json();
    const hasParams = parsed.city || parsed.county || parsed.beds || parsed.baths
      || parsed.minPrice || parsed.maxPrice || parsed.propertyType || parsed.q;
    if (hasParams) {
      failures.push(`Should route to chat but parser returned: ${JSON.stringify(parsed)}`);
    }
    return { pass: failures.length === 0, detail: failures.join("; ") || "Routes to chat" };
  }

  // 3. Parse test
  const res = await fetch(`${IDX_API}/api/idx/parse-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: test.input }),
  });
  const parsed = await res.json();

  if (test.expectParse) {
    for (const [key, expected] of Object.entries(test.expectParse)) {
      const actual = parsed[key];
      if (key === "county" && typeof expected === "string") {
        if (!actual || !String(actual).toLowerCase().includes(String(expected).toLowerCase())) {
          failures.push(`${key}: expected "${expected}", got "${actual}"`);
        }
      } else if (actual !== expected) {
        failures.push(`${key}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    }
  }

  // 4. Search test (if city or county found)
  if (test.expectMinResults && (parsed.city || parsed.county || parsed.maxPrice || parsed.beds)) {
    const searchParams = new URLSearchParams();
    if (parsed.city) searchParams.set("city", parsed.city);
    if (parsed.county) searchParams.set("county", parsed.county);
    if (parsed.maxPrice) searchParams.set("maxPrice", String(parsed.maxPrice));
    if (parsed.beds) searchParams.set("beds", String(parsed.beds));
    searchParams.set("limit", "5");

    const sRes = await fetch(`${IDX_API}/api/idx/listings?${searchParams}`);
    const sData = await sRes.json();
    if ((sData.total || 0) < test.expectMinResults) {
      failures.push(`Expected ${test.expectMinResults}+ results, got ${sData.total}`);
    }
  }

  return {
    pass: failures.length === 0,
    detail: failures.length ? failures.join("; ") : `Parsed: ${JSON.stringify(parsed)}`,
  };
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  NJ Realty Bot — Full Simulation Tests");
  console.log("═══════════════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;
  let currentCategory = "";

  for (const test of TESTS) {
    if (test.category !== currentCategory) {
      currentCategory = test.category;
      console.log(`\n── ${currentCategory} ──────────────────────────────────`);
    }

    try {
      const result = await runTest(test);
      if (result.pass) {
        console.log(`  ✅ ${test.id}: "${test.input}"`);
        passed++;
      } else {
        console.log(`  ❌ ${test.id}: "${test.input}"`);
        console.log(`     → ${result.detail}`);
        failed++;
      }
    } catch (e: any) {
      console.log(`  💥 ${test.id}: "${test.input}"`);
      console.log(`     → CRASHED: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed, ${TESTS.length} total`);
  console.log(`═══════════════════════════════════════════════════════════`);

  if (failed > 0) process.exit(1);
}

main();
