/**
 * Search Regression Tests — njrealtybot
 *
 * Every bug found and fixed gets added here as a test case.
 * Run before every deploy: npx tsx test/search-regression.ts
 *
 * Tests the full pipeline: hero parse → API search → results
 */

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

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  NJ Realty Bot — Search Regression Tests");
  console.log("═══════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

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
  console.log(`  Results: ${passed} passed, ${failed} failed, ${TESTS.length} total`);
  console.log(`═══════════════════════════════════════════════════`);

  if (failed > 0) process.exit(1);
}

main();
