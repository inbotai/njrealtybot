import { Page, Locator } from "@playwright/test";

export default class FSBOPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly valuationCTA: Locator;
  readonly taxCTA: Locator;
  readonly comparisonTable: Locator;
  readonly guaranteeSection: Locator;
  readonly faqSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 }).first();
    this.valuationCTA = page.getByRole("link", { name: /value|estimate|sell/i }).first();
    this.taxCTA = page.getByRole("link", { name: /tax/i }).first();
    this.comparisonTable = page.locator("table, [data-testid='comparison']").first();
    this.guaranteeSection = page.locator(
      "section:has-text('guarantee'), [data-testid='guarantee']"
    ).first();
    this.faqSection = page.locator(
      "section:has-text('FAQ'), [data-testid='faq'], details"
    ).first();
  }

  async goto() {
    await this.page.goto("/fsbo");
  }
}
