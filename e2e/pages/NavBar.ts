import { Page, Locator } from "@playwright/test";

export default class NavBar {
  readonly page: Page;
  readonly logo: Locator;
  readonly buyLink: Locator;
  readonly sellLink: Locator;
  readonly taxAppealLink: Locator;
  readonly marketLink: Locator;
  readonly dealsLink: Locator;
  readonly moreButton: Locator;
  readonly moreDropdown: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole("link", { name: "Garden State AI" }).first();
    this.buyLink = page.getByRole("link", { name: /buy/i }).first();
    this.sellLink = page.getByRole("link", { name: /sell/i }).first();
    this.taxAppealLink = page.getByRole("link", { name: /tax/i }).first();
    this.marketLink = page.getByRole("link", { name: /market|news/i }).first();
    this.dealsLink = page.getByRole("link", { name: /deals|open houses/i }).first();
    this.moreButton = page.getByRole("button", { name: /more/i }).first();
    this.moreDropdown = page.locator("[data-testid='more-dropdown'], .dropdown-menu").first();
    this.mobileMenuButton = page.locator("button[aria-label*='menu' i], button:has(svg)").first();
  }

  async clickLink(name: string) {
    await this.page.getByRole("link", { name: new RegExp(name, "i") }).first().click();
  }

  async openMore() {
    await this.moreButton.click();
  }

  async isMobileMenuVisible(): Promise<boolean> {
    return this.mobileMenuButton.isVisible();
  }
}
