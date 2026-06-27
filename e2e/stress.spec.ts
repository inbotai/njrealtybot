import { test, expect } from "@playwright/test";

/**
 * Stress tests — simulate 10 concurrent users hitting gardenstate.ai.
 * Uses Playwright's parallel workers to run tests simultaneously.
 * Each test simulates a different user journey.
 */

test.describe.configure({ mode: "parallel" });

const PAGES = [
  "/", "/sell", "/tax-shock", "/news", "/fsbo",
  "/chat", "/afford", "/net-proceeds", "/renovate", "/open-houses",
];

// 10 concurrent page loads — simulates 10 users landing simultaneously
for (let i = 0; i < 10; i++) {
  test(`concurrent user ${i + 1} — loads ${PAGES[i]}`, async ({ page }) => {
    const start = Date.now();
    await page.goto(PAGES[i], { timeout: 15000 });
    const elapsed = Date.now() - start;

    // Page should load within 10 seconds
    expect(elapsed).toBeLessThan(10000);
    // Page should have content
    await expect(page.locator("body")).not.toBeEmpty();
    // No 500 errors
    const title = await page.title();
    expect(title).not.toContain("500");
    expect(title).not.toContain("Error");
  });
}

// API stress — 10 concurrent search requests
test.describe("API stress", () => {
  const CITIES = [
    "Hoboken", "Jersey City", "Clifton", "Tenafly", "Hackensack",
    "Fort Lee", "Englewood", "Ridgewood", "Paramus", "Wayne",
  ];

  for (let i = 0; i < 10; i++) {
    test(`concurrent API search ${i + 1} — ${CITIES[i]}`, async ({ request }) => {
      const start = Date.now();
      const resp = await request.get(
        `https://inbot-idx-api-production.up.railway.app/api/idx/listings?city=${CITIES[i]}&limit=5`,
        { timeout: 15000 }
      );
      const elapsed = Date.now() - start;

      expect(resp.ok()).toBeTruthy();
      expect(elapsed).toBeLessThan(10000);
      const data = await resp.json();
      expect(data.listings).toBeDefined();
    });
  }
});

// Mixed journey stress — 5 users doing real workflows simultaneously
test.describe("workflow stress", () => {
  test("user A — browse and search", async ({ page }) => {
    await page.goto("/");
    await page.goto("/search");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("user B — tax analysis flow", async ({ page }) => {
    await page.goto("/tax-shock");
    await expect(page.locator("input").first()).toBeVisible();
  });

  test("user C — read news articles", async ({ page }) => {
    await page.goto("/news");
    const article = page.locator("a[href^='/news/']").first();
    if (await article.isVisible()) {
      await article.click();
      await expect(page.locator("article, .prose").first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("user D — valuation flow", async ({ page }) => {
    await page.goto("/sell");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("user E — FSBO landing", async ({ page }) => {
    await page.goto("/fsbo");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });
});
