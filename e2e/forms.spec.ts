import { test, expect } from "@playwright/test";
import SellPage from "./pages/SellPage";
import TaxShockPage from "./pages/TaxShockPage";

test.describe("Forms & tool inputs", () => {
  test("/sell — address input accepts text and submit button visible", async ({ page }) => {
    const sell = new SellPage(page);
    await sell.goto();
    await expect(sell.addressInput).toBeVisible();
    await sell.enterAddress("123 Main St, Newark, NJ");
    await expect(sell.addressInput).toHaveValue(/123 Main/);
    await expect(sell.submitButton).toBeVisible();
  });

  test("/tax-shock — address input and Check My Taxes button", async ({ page }) => {
    const tax = new TaxShockPage(page);
    await tax.goto();
    await expect(tax.addressInput).toBeVisible();
    await tax.addressInput.fill("456 Oak Ave, Jersey City, NJ");
    await expect(tax.addressInput).toHaveValue(/456 Oak/);
    await expect(tax.checkButton).toBeVisible();
  });

  test("/comp-alerts — page loads with inputs", async ({ page }) => {
    await page.goto("/comp-alerts");
    await expect(page.locator("input").first()).toBeVisible({ timeout: 15000 });
  });

  test("/alerts — phone input and submit visible", async ({ page }) => {
    await page.goto("/alerts");
    const phoneInput = page.locator("input[type='tel'], input[placeholder*='phone' i], input[name*='phone' i]").first();
    await expect(phoneInput).toBeVisible({ timeout: 15000 });
    const submitBtn = page.getByRole("button", { name: /submit|sign|alert|notify/i }).first();
    await expect(submitBtn).toBeVisible();
  });

  test("/contact — form fields visible", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("input[name*='name' i], input[placeholder*='name' i]").first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator("input[name*='email' i], input[type='email']").first()).toBeVisible();
    await expect(page.locator("textarea, input[name*='message' i]").first()).toBeVisible();
  });

  test("/list — onboarding wizard step 1 loads", async ({ page }) => {
    await page.goto("/list");
    await expect(page.locator("input").first()).toBeVisible({ timeout: 15000 });
    const nextBtn = page.getByRole("button", { name: /next|continue|start/i }).first();
    await expect(nextBtn).toBeVisible();
  });

  test("/afford — income and down payment inputs visible", async ({ page }) => {
    await page.goto("/afford");
    const inputs = page.locator("input");
    await expect(inputs.first()).toBeVisible({ timeout: 15000 });
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(2);
  });

  test("/net-proceeds — sale price input visible", async ({ page }) => {
    await page.goto("/net-proceeds");
    const priceInput = page.locator("input").first();
    await expect(priceInput).toBeVisible({ timeout: 15000 });
  });

  test("/sell-timing — address input visible", async ({ page }) => {
    await page.goto("/sell-timing");
    const input = page.locator("input").first();
    await expect(input).toBeVisible({ timeout: 15000 });
  });
});
