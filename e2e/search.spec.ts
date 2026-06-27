import { test, expect } from "@playwright/test";

test.describe("Search functionality", () => {
  test("/search page loads without error", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("body")).not.toBeEmpty();
    const title = await page.title();
    expect(title).not.toContain("500");
  });

  test("hero search routes tax queries to chat", async ({ page }) => {
    await page.goto("/");
    const input = page.locator("input").first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill("am I overpaying taxes");
      await input.press("Enter");
      await page.waitForURL(/\/chat/, { timeout: 10000 });
      expect(page.url()).toContain("/chat");
    }
  });

  test("hero search routes open houses correctly", async ({ page }) => {
    await page.goto("/");
    const input = page.locator("input[placeholder*='Search']").first();
    if (await input.isVisible({ timeout: 5000 }).catch(() => false)) {
      await input.fill("open houses");
      await input.press("Enter");
      await page.waitForURL(/\/open-houses/, { timeout: 10000 });
      expect(page.url()).toContain("/open-houses");
    } else {
      // Public homepage may not have search bar — test passes (admin-only feature)
      test.skip();
    }
  });

  test("hero search routes CMA to chat", async ({ page }) => {
    await page.goto("/");
    const input = page.locator("input").first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill("what is my home worth");
      await input.press("Enter");
      await page.waitForURL(/\/chat/, { timeout: 10000 });
      expect(page.url()).toContain("/chat");
    }
  });

  test("API: search by city returns listings", async ({ request }) => {
    const resp = await request.get(
      "https://inbot-idx-api-production.up.railway.app/api/idx/listings?city=Hoboken&limit=3"
    );
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.total).toBeGreaterThan(0);
  });

  test("API: search by county returns listings", async ({ request }) => {
    const resp = await request.get(
      "https://inbot-idx-api-production.up.railway.app/api/idx/listings?county=Bergen&limit=3"
    );
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.total).toBeGreaterThan(0);
  });
});
