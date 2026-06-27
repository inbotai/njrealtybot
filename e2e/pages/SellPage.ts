import { Page, Locator } from "@playwright/test";

export default class SellPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addressInput: Locator;
  readonly submitButton: Locator;
  readonly resultSection: Locator;
  readonly valuationAmount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 }).first();
    this.addressInput = page.locator("input").first();
    this.submitButton = page.getByRole("button", { name: /get|estimate|value/i }).first();
    this.resultSection = page.locator("[data-testid='result'], .result, section").first();
    this.valuationAmount = page.locator("[data-testid='valuation'], .valuation").first();
  }

  async goto() {
    await this.page.goto("/sell");
  }

  async enterAddress(addr: string) {
    await this.addressInput.fill(addr);
  }

  async submitValuation() {
    await this.submitButton.click();
  }
}
