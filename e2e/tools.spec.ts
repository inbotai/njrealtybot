import { test, expect } from "@playwright/test";

test.describe("Tool pages load without errors", () => {
  test("/offers loads without 500", async ({ page }) => {
    const resp = await page.goto("/offers");
    expect(resp?.status()).not.toBe(500);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("/my-listing loads", async ({ page }) => {
    const resp = await page.goto("/my-listing");
    expect(resp?.status()).not.toBe(500);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("/market loads", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 15000 });
  });

  test("/deals loads", async ({ page }) => {
    await page.goto("/deals");
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15000 });
  });

  test("/open-houses loads with content", async ({ page }) => {
    await page.goto("/open-houses");
    await expect(page.locator("body")).not.toBeEmpty();
    // Should have at least a heading or listing cards
    const content = page.locator("h1, h2, article, [class*='card']").first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  test("/renovate loads", async ({ page }) => {
    const resp = await page.goto("/renovate");
    expect(resp?.status()).not.toBe(500);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("/afford loads with inputs", async ({ page }) => {
    await page.goto("/afford");
    await expect(page.locator("input").first()).toBeVisible({ timeout: 15000 });
  });

  test("/net-proceeds loads with input", async ({ page }) => {
    await page.goto("/net-proceeds");
    await expect(page.locator("input").first()).toBeVisible({ timeout: 15000 });
  });
});
