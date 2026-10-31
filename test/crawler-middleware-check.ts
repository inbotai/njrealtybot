import { AsyncLocalStorage } from "node:async_hooks";
import { INDEXNOW_KEY_PATH } from "../src/lib/indexnow";

type GateResult = {
  status: number;
  next: string | null;
  location: string | null;
  cookie: string | undefined;
  cache: string | null;
};

export async function runCrawlerMiddlewareChecks(): Promise<{ pass: boolean; detail: string }> {
  (globalThis as { AsyncLocalStorage?: typeof AsyncLocalStorage }).AsyncLocalStorage = AsyncLocalStorage;
  const { NextRequest } = await import("next/server");
  const { unstable_doesMiddlewareMatch } = await import("next/experimental/testing/server");
  const { middleware, config } = await import("../src/middleware");

  const failures: string[] = [];
  const check = (label: string, ok: boolean) => {
    if (!ok) failures.push(label);
  };

  function gate(ua: string | null, path: string, host = "gardenstate.ai"): GateResult {
    const headers = new Headers({ host });
    if (ua !== null) headers.set("user-agent", ua);
    const res = middleware(new NextRequest(`https://${host}${path}`, { headers }));
    return {
      status: res.status,
      next: res.headers.get("x-middleware-next"),
      location: res.headers.get("location"),
      cookie: res.cookies.get("gsai_idx")?.value,
      cache: res.headers.get("cache-control"),
    };
  }

  function matched(url: string) {
    return unstable_doesMiddlewareMatch({ config, url });
  }

  const googlebot = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
  const gptbot = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)";

  const gptHome = gate(gptbot, "/");
  const googleHome = gate(googlebot, "/");
  check("GPTBot / is 403", gptHome.status === 403 && gptHome.cache === "private, no-store");
  check("Googlebot / is 200", googleHome.status === 200 && googleHome.next === "1" && googleHome.cookie === undefined);

  check("GPTBot robots.txt passes", gate(gptbot, "/robots.txt").status === 200 && gate(gptbot, "/robots.txt").next === "1");
  check("GPTBot IndexNow key passes", gate(gptbot, INDEXNOW_KEY_PATH).next === "1");
  check("GPTBot /api is 403", gate(gptbot, "/api/admin/session").status === 403);
  check("GPTBot svg is 403", gate(gptbot, "/logo-512.svg").status === 403);
  check("GPTBot sitemap is 403", gate(gptbot, "/sitemap.xml").status === 403);
  check("browser with no UA passes", gate(null, "/").status === 200 && gate(null, "/").next === "1");

  for (const ua of ["bingbot/2.0", "OAI-SearchBot/1.0", "ChatGPT-User/1.0", "Claude-SearchBot/1.0", "Claude-User/1.0", "Perplexity-User", "DuckDuckBot/1.0", "Applebot/0.1", "facebookexternalhit/1.1", "Twitterbot/1.0"]) {
    check(`${ua} allowed`, gate(ua, "/").status === 200);
  }
  for (const ua of ["ClaudeBot/1.0", "Bytespider", "CCBot/2.0", "PerplexityBot", "Applebot-Extended", "Google-Extended", "GoogleOther", "anthropic-ai", "Amazonbot"]) {
    check(`${ua} blocked`, gate(ua, "/").status === 403);
  }

  const idxAdmin = gate(googlebot, "/admin", "idxlistings.gardenstate.ai");
  check("Googlebot idx /admin still redirects", idxAdmin.status === 307 && (idxAdmin.location?.endsWith("/") ?? false));
  const idxHome = gate(googlebot, "/", "idxlistings.gardenstate.ai");
  check("Googlebot idx / still sets host cookie", idxHome.status === 200 && idxHome.cookie === "1");
  const idxApi = gate("Mozilla/5.0", "/api/admin/session", "idxlistings.gardenstate.ai");
  check("idx API stays out of host routing", idxApi.status === 200 && idxApi.cookie === undefined && idxApi.next === "1");
  const idxSvg = gate("Mozilla/5.0", "/logo-512.svg", "idxlistings.gardenstate.ai");
  check("idx static file stays out of host routing", idxSvg.status === 200 && idxSvg.cookie === undefined);
  const gptIdx = gate(gptbot, "/admin", "idxlistings.gardenstate.ai");
  check("GPTBot on idx is 403 before host redirect", gptIdx.status === 403 && gptIdx.location == null);

  check("matcher runs on /", matched("https://gardenstate.ai/"));
  check("matcher runs on /api", matched("https://gardenstate.ai/api/admin/session"));
  check("matcher runs on svg", matched("https://gardenstate.ai/logo-512.svg"));
  check("matcher runs on robots.txt", matched("https://gardenstate.ai/robots.txt"));
  check("matcher runs on IndexNow key", matched(`https://gardenstate.ai${INDEXNOW_KEY_PATH}`));
  check("matcher runs on sitemap", matched("https://gardenstate.ai/sitemap.xml"));
  check("matcher skips _next/static", !matched("https://gardenstate.ai/_next/static/chunks/main.js"));
  check("matcher skips _next/image", !matched("https://gardenstate.ai/_next/image"));
  check("matcher runs on favicon", matched("https://gardenstate.ai/favicon.ico"));
  check("GPTBot favicon is 403", gate(gptbot, "/favicon.ico").status === 403);
  const idxFavicon = gate(googlebot, "/favicon.ico", "idxlistings.gardenstate.ai");
  check("idx favicon skips host routing", idxFavicon.status === 200 && idxFavicon.next === "1" && idxFavicon.cookie === undefined);

  return { pass: failures.length === 0, detail: failures.join("; ") || "403 for training crawlers, 200 for Googlebot, idx routing unchanged" };
}
