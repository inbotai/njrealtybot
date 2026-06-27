import { test, expect } from "@playwright/test";

// Use the mobile project defined in playwright.config.ts
test.use({ viewport: { width: 412, height: 915 } });

test.describe("Mobile responsiveness", () => {
  test("homepage renders without horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test("navbar shows hamburger menu on mobile", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.locator(
      "button[aria-label*='menu' i], button:has(svg.lucide-menu), [data-testid='mobile-menu']"
    ).first();
    await expect(hamburger).toBeVisible({ timeout: 10000 });
  });

  test("/sell form is usable on mobile", async ({ page }) => {
    await page.goto("/sell");
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
    const input = page.locator("input").first();
    await expect(input).toBeVisible();
    // Input should be wide enough to tap
    const box = await input.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(150);
    await input.fill("123 Test St");
    await expect(input).toHaveValue(/123 Test/);
  });

  test("/tax-shock form is usable on mobile", async ({ page }) => {
    await page.goto("/tax-shock");
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
    const input = page.locator("input").first();
    await expect(input).toBeVisible();
    const box = await input.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(150);
    await input.fill("456 Test Ave");
    await expect(input).toHaveValue(/456 Test/);
  });

  test("/news articles display in single column on mobile", async ({ page }) => {
    await page.goto("/news");
    const articles = page.locator("a[href^='/news/']");
    await expect(articles.first()).toBeVisible({ timeout: 15000 });
    const count = await articles.count();
    if (count >= 2) {
      const first = await articles.nth(0).boundingBox();
      const second = await articles.nth(1).boundingBox();
      expect(first).toBeTruthy();
      expect(second).toBeTruthy();
      // In single column, second article should be below the first (not side-by-side)
      expect(second!.y).toBeGreaterThan(first!.y);
    }
  });
});
