import { Page, Locator } from "@playwright/test";

export default class SearchPage {
  readonly page: Page;
  readonly cityInput: Locator;
  readonly statusSelect: Locator;
  readonly typeSelect: Locator;
  readonly sortSelect: Locator;
  readonly bedsSelect: Locator;
  readonly bathsSelect: Locator;
  readonly minPrice: Locator;
  readonly maxPrice: Locator;
  readonly listings: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cityInput = page.locator("input[placeholder*='city' i], input[name='city']").first();
    this.statusSelect = page.locator("select[name='status'], [data-testid='status']").first();
    this.typeSelect = page.locator("select[name='type'], [data-testid='type']").first();
    this.sortSelect = page.locator("select[name='sort'], [data-testid='sort']").first();
    this.bedsSelect = page.locator("select[name='beds'], [data-testid='beds']").first();
    this.bathsSelect = page.locator("select[name='baths'], [data-testid='baths']").first();
    this.minPrice = page.locator("input[name='minPrice'], [data-testid='minPrice']").first();
    this.maxPrice = page.locator("input[name='maxPrice'], [data-testid='maxPrice']").first();
    this.listings = page.locator("[data-testid='listing'], .listing-card, article");
    this.pagination = page.locator("nav[aria-label='pagination'], .pagination").first();
  }

  async goto() {
    await this.page.goto("/search");
  }

  async searchByCity(city: string) {
    await this.cityInput.fill(city);
    await this.cityInput.press("Enter");
  }

  async filterByBeds(beds: string) {
    await this.bedsSelect.selectOption(beds);
  }

  async getListingCount(): Promise<number> {
    return this.listings.count();
  }
}
