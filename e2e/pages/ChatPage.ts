import { Page, Locator } from "@playwright/test";

export default class ChatPage {
  readonly page: Page;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly messages: Locator;
  readonly valeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatInput = page.locator("input[type='text'], textarea").first();
    this.sendButton = page.getByRole("button", { name: /send/i }).first();
    this.messages = page.locator("[data-testid='message'], .message, [role='log'] > *");
    this.valeHeader = page.getByRole("heading", { name: "Vale" }).first();
  }

  async goto() {
    await this.page.goto("/chat");
  }

  async sendMessage(text: string) {
    await this.chatInput.fill(text);
    await this.sendButton.click();
  }

  async waitForResponse() {
    const count = await this.messages.count();
    await this.messages.nth(count).waitFor({ timeout: 15000 });
  }

  async getLastResponse(): Promise<string> {
    const count = await this.messages.count();
    return (await this.messages.nth(count - 1).textContent()) ?? "";
  }
}
