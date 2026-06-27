import { Page, Locator } from "@playwright/test";

export default class TaxShockPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addressInput: Locator;
  readonly checkButton: Locator;
  readonly resultSection: Locator;
  readonly savingsAmount: Locator;
  readonly appealLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 }).first();
    this.addressInput = page.locator("input").first();
    this.checkButton = page.getByRole("button", { name: /check|analyze|see/i }).first();
    this.resultSection = page.locator("[data-testid='result'], .result, section").first();
    this.savingsAmount = page.locator("[data-testid='savings'], .savings").first();
    this.appealLink = page.getByRole("link", { name: /appeal/i }).first();
  }

  async goto() {
    await this.page.goto("/tax-shock");
  }

  async analyze(address: string) {
    await this.addressInput.fill(address);
    await this.checkButton.click();
  }
}
