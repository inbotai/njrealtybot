import { Page, Locator } from "@playwright/test";

export default class HomePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly sellCTA: Locator;
  readonly taxCTA: Locator;
  readonly fsboCTA: Locator;
  readonly suggestions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole("link", { name: "Garden State AI" }).first();
    this.searchInput = page.locator("input[placeholder*='Search']").first();
    this.searchButton = page.locator("button:has-text('Search')").first();
    this.sellCTA = page.locator("a[href='/sell']").first();
    this.taxCTA = page.locator("a[href='/tax-shock']").first();
    this.fsboCTA = page.locator("a[href='/fsbo']").first();
    this.suggestions = page
      .locator("button")
      .filter({ hasText: /Houses in|Rentals|bed in|home worth|taxes/i });
  }

  async goto() {
    await this.page.goto("/");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }
}
