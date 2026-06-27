import { test, expect } from "@playwright/test";

test.describe("Smoke tests — gardenstate.ai", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Garden State AI" }).first()).toBeVisible();
    // Public page has valuation input OR admin page has search bar
    const hasInput = await page.locator("input").first().isVisible().catch(() => false);
    expect(hasInput).toBeTruthy();
  });

  test("sell page loads", async ({ page }) => {
    await page.goto("/sell");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("tax-shock page loads", async ({ page }) => {
    await page.goto("/tax-shock");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("input").first()).toBeVisible();
  });

  test("news page loads with articles", async ({ page }) => {
    await page.goto("/news");
    await expect(page.getByRole("heading", { name: /News/i }).first()).toBeVisible();
    const articles = page.locator("a[href^='/news/']");
    await expect(articles.first()).toBeVisible({ timeout: 10000 });
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("fsbo page loads", async ({ page }) => {
    await page.goto("/fsbo");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("open-houses page loads", async ({ page }) => {
    await page.goto("/open-houses");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("chat page loads Vale", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByRole("heading", { name: "Vale" }).first()).toBeVisible();
  });

  test("news article renders HTML not markdown", async ({ page }) => {
    await page.goto("/news");
    const firstArticle = page.locator("a[href^='/news/']").first();
    const href = await firstArticle.getAttribute("href");
    if (href) {
      await page.goto(href);
      const h2 = page.locator("article h2, .prose h2").first();
      await expect(h2).toBeVisible({ timeout: 10000 });
      const body = await page.locator("article, .prose").first().textContent();
      expect(body).not.toContain("## ");
    }
  });

  test("API responds", async ({ request }) => {
    const resp = await request.get(
      "https://inbot-idx-api-production.up.railway.app/api/idx/listings?limit=1",
      { timeout: 15000 }
    );
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.total).toBeGreaterThan(0);
  });
});
