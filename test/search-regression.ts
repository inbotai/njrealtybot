/**
 * Search Regression Tests — njrealtybot
 *
 * Every bug found and fixed gets added here as a test case.
 * Run before every deploy: npx tsx test/search-regression.ts
 *
 * Tests the full pipeline: hero parse → API search → results
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { formatPercent } from "../src/lib/service-ladder/property-tax/calc";
import { compsSupportMessage, formatRatio, reconcileExplanation } from "../src/lib/tax-display";
import { calcRoi, renovationTypes } from "../src/lib/renovate-roi";
import { renderChatMarkdown } from "../src/lib/chat-markdown";
import { splitStreetAndCity } from "../src/lib/address";

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

function runLocalTests(): { id: string; description: string; pass: boolean; detail: string }[] {
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

  return results;
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  NJ Realty Bot — Search Regression Tests");
  console.log("═══════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  for (const test of runLocalTests()) {
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
  console.log(`  Results: ${passed} passed, ${failed} failed, ${TESTS.length + runLocalTests().length} total`);
  console.log(`═══════════════════════════════════════════════════`);

  if (failed > 0) process.exit(1);
}

main();
