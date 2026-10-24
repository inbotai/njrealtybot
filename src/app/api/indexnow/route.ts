import sitemap from "@/app/sitemap";
import { submitIndexNow } from "@/lib/indexnow";
import { ADMIN_COOKIE, readCookie, verifySession } from "@/lib/server/admin-session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  return verifySession(readCookie(req, ADMIN_COOKIE));
}

async function sitemapUrls(): Promise<string[]> {
  const entries = await sitemap();
  return entries.map((entry) => entry.url);
}

async function submit(urls: string[]) {
  const result = await submitIndexNow(urls);
  if (result.submitted === 0) {
    return Response.json({ error: "No gardenstate.ai URLs to submit", ...result }, { status: 400 });
  }
  const ok = result.results.length > 0 && result.results.every((batch) => batch.ok);
  return Response.json(result, { status: ok ? 200 : 502 });
}

export async function GET(req: Request) {
  if (!authorized(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const mode = new URL(req.url).searchParams.get("mode");
  if (mode !== "sitemap") {
    return Response.json({ ok: true, mode: "idle" });
  }
  return submit(await sitemapUrls());
}

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: { urls?: unknown; allSitemap?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (body.allSitemap === true) return submit(await sitemapUrls());
  if (!Array.isArray(body.urls) || body.urls.some((url) => typeof url !== "string")) {
    return Response.json({ error: "Provide urls or allSitemap: true" }, { status: 400 });
  }
  return submit(body.urls);
}
