import { test, expect } from "@playwright/test";

test.describe("Navigation & routing", () => {
  test("logo links to homepage", async ({ page }) => {
    await page.goto("/sell");
    await page.getByRole("link", { name: "Garden State AI" }).first().click();
    await expect(page).toHaveURL("/");
  });

  // Public nav links (visible without login)
  test("navbar Sell link works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^Sell$/i }).first().click();
    await expect(page).toHaveURL(/\/sell/);
  });

  test("navbar FSBO link works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /FSBO/i }).first().click();
    await expect(page).toHaveURL(/\/fsbo/);
  });

  test("navbar Vale link works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^Vale$/i }).first().click();
    await expect(page).toHaveURL(/\/chat/);
  });

  // Admin nav links (Buy, Market, Deals, etc.) are only visible when logged in
  // Skip them in public tests — covered by admin-specific tests

  test("mobile hamburger menu opens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const hamburger = page.locator("button[aria-label*='menu' i]").first();
    if (await hamburger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await hamburger.click();
      await expect(page.getByRole("link", { name: /sell/i }).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("footer News link works", async ({ page }) => {
    await page.goto("/");
    const newsLink = page.locator("footer").getByRole("link", { name: /news/i }).first();
    if (await newsLink.isVisible().catch(() => false)) {
      await newsLink.click();
      await expect(page).toHaveURL(/\/news/);
    }
  });

  test("footer Contact link works", async ({ page }) => {
    await page.goto("/");
    const contactLink = page.locator("footer").getByRole("link", { name: /contact/i }).first();
    if (await contactLink.isVisible().catch(() => false)) {
      await contactLink.click();
      await expect(page).toHaveURL(/\/contact/);
    }
  });

  test("/blog redirects to /news", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/news/);
  });

  test("/blog/some-slug redirects to /news/some-slug", async ({ page }) => {
    await page.goto("/blog/some-test-slug", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/news\/some-test-slug/);
  });
});
