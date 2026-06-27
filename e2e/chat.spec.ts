import { test, expect } from "@playwright/test";

test.describe("Vale chat", () => {
  test("/chat loads with Vale header", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByRole("heading", { name: "Vale" }).first()).toBeVisible({ timeout: 15000 });
  });

  test("/chat has an iframe or input for chat", async ({ page }) => {
    await page.goto("/chat");
    // Chat page uses either a native input or an iframe widget
    const hasInput = await page.locator("input, textarea, iframe").first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasInput).toBeTruthy();
  });

  test("WhatsApp link is present", async ({ page }) => {
    await page.goto("/chat");
    const waLink = page.locator("a[href*='wa.me'], a[href*='whatsapp']").first();
    await expect(waLink).toBeVisible({ timeout: 10000 });
  });

  test("chat API responds to start", async ({ request }) => {
    const resp = await request.post(
      "https://inbot-idx-api-production.up.railway.app/api/idx/chat/start",
      { data: {} }
    );
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data.sessionId || data.session_id).toBeTruthy();
  });

  test("chat API responds to message", async ({ request }) => {
    test.setTimeout(90000);
    const startResp = await request.post(
      "https://inbot-idx-api-production.up.railway.app/api/idx/chat/start",
      { data: {} }
    );
    const startData = await startResp.json();
    const sessionId = startData.sessionId || startData.session_id;

    const msgResp = await request.post(
      "https://inbot-idx-api-production.up.railway.app/api/idx/chat/message",
      {
        data: { sessionId, message: "hello" },
        timeout: 80000,
      }
    );
    expect(msgResp.ok()).toBeTruthy();
    const msgData = await msgResp.json();
    expect(msgData.response || msgData.text).toBeTruthy();
  });
});
