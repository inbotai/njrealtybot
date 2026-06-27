import { Page, Locator } from "@playwright/test";

export default class NewsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly articles: Locator;
  readonly featuredArticle: Locator;
  readonly categoryBadges: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /News/i }).first();
    this.articles = page.locator("a[href^='/news/']");
    this.featuredArticle = page.locator("a[href^='/news/']").first();
    this.categoryBadges = page.locator("[data-testid='category'], .badge, .category");
  }

  async goto() {
    await this.page.goto("/news");
  }

  async getArticleCount(): Promise<number> {
    return this.articles.count();
  }

  async clickFirstArticle() {
    await this.featuredArticle.click();
  }
}
