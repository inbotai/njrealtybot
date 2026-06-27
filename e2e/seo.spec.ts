import { test, expect } from "@playwright/test";

const pagesWithMeta = ["/", "/sell", "/tax-shock", "/fsbo", "/news", "/search", "/chat"];

test.describe("SEO validation", () => {
  test("homepage has correct title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
    expect(title.toLowerCase()).toMatch(/garden\s*state|real\s*estate|nj|new\s*jersey/i);
  });

  test("/sell title contains Home Valuation", async ({ page }) => {
    await page.goto("/sell");
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/home.*valuation|what.*worth|sell/i);
  });

  test("/tax-shock title contains Tax", async ({ page }) => {
    await page.goto("/tax-shock");
    const title = await page.title();
    expect(title.toLowerCase()).toContain("tax");
  });

  test("/fsbo title contains FSBO or Selling", async ({ page }) => {
    await page.goto("/fsbo");
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/fsbo|sell/i);
  });

  test("/news title contains News", async ({ page }) => {
    await page.goto("/news");
    const title = await page.title();
    expect(title.toLowerCase()).toContain("news");
  });

  test("all pages have meta description", async ({ page }) => {
    for (const path of pagesWithMeta) {
      await page.goto(path);
      const desc = page.locator("meta[name='description']");
      const content = await desc.getAttribute("content");
      expect(content, `Missing meta description on ${path}`).toBeTruthy();
      expect(content!.length, `Empty meta description on ${path}`).toBeGreaterThan(10);
    }
  });

  test("all pages have canonical URL", async ({ page }) => {
    for (const path of pagesWithMeta) {
      await page.goto(path);
      const canonical = page.locator("link[rel='canonical']");
      const href = await canonical.getAttribute("href");
      expect(href, `Missing canonical on ${path}`).toBeTruthy();
    }
  });

  test("/tax-shock has FAQ schema", async ({ page }) => {
    await page.goto("/tax-shock");
    const jsonLd = page.locator("script[type='application/ld+json']");
    const count = await jsonLd.count();
    let foundFaq = false;
    for (let i = 0; i < count; i++) {
      const text = await jsonLd.nth(i).textContent();
      if (text && text.includes("FAQPage")) {
        foundFaq = true;
        break;
      }
    }
    expect(foundFaq, "Missing FAQPage JSON-LD on /tax-shock").toBe(true);
  });

  test("homepage has Organization schema", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator("script[type='application/ld+json']");
    const count = await jsonLd.count();
    let foundOrg = false;
    for (let i = 0; i < count; i++) {
      const text = await jsonLd.nth(i).textContent();
      if (text && text.includes("Organization")) {
        foundOrg = true;
        break;
      }
    }
    expect(foundOrg, "Missing Organization JSON-LD on homepage").toBe(true);
  });

  test("/sell has WebApplication schema", async ({ page }) => {
    await page.goto("/sell");
    const jsonLd = page.locator("script[type='application/ld+json']");
    const count = await jsonLd.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await jsonLd.nth(i).textContent();
      if (text && text.includes("WebApplication")) {
        found = true;
        break;
      }
    }
    expect(found, "Missing WebApplication JSON-LD on /sell").toBe(true);
  });

  test("robots.txt exists and disallows /admin", async ({ request }) => {
    const resp = await request.get("https://gardenstate.ai/robots.txt");
    expect(resp.ok()).toBeTruthy();
    const body = await resp.text();
    expect(body).toContain("Disallow");
    expect(body.toLowerCase()).toContain("/admin");
  });
});
