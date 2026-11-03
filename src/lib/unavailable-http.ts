import { NextResponse } from "next/server";
import { fetchListing } from "./api";
import { isListingNotFound, isListingUnavailable } from "./listing-fetch";

const UUID_AT_START = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Id from a property, showcase, or open-house URL. MLS-only slugs return null. */
export function singleListingId(pathname: string): string | null {
  const match = pathname.match(/^\/property\/([^/]+)$/)
    || pathname.match(/^\/listing\/([^/]+)\/showcase$/)
    || pathname.match(/^\/open-house\/([^/]+)$/)
    || pathname.match(/^\/open-house\/qr\/([^/]+)$/);
  if (!match) return null;
  let slug = match[1];
  try { slug = decodeURIComponent(slug); } catch { /* keep the raw slug */ }
  if (!UUID_AT_START.test(slug)) return null;
  return slug.slice(0, 36);
}

/**
 * 503 page when the listing API is down.
 * A found listing and a confirmed 404 return null so the page can render.
 * This runs in middleware, before the page. A fresh ISR hit is served by the
 * cache without this lookup. A stale page is still served when the page render
 * keeps the last good copy; this response is what a never-cached URL receives.
 */
export async function listingOutageResponse(id: string): Promise<Response | null> {
  try {
    await fetchListing(id);
    return null;
  } catch (error) {
    if (isListingNotFound(error)) return null;
    if (isListingUnavailable(error)) {
      console.error("OUTAGE_503", id, error.retryAfter);
      return unavailablePageResponse(error.retryAfter);
    }
    return null;
  }
}

/** HTML document for a listing that cannot be loaded right now. Not cached. */
export function unavailablePageResponse(retryAfterSeconds = 60): Response {
  const retryAfter = String(Math.min(86400, Math.max(0, Math.ceil(retryAfterSeconds))));
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Temporarily unavailable</title>
</head>
<body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#1a2332">
  <main style="max-width:32rem;margin:0 auto;min-height:60vh;padding:4rem 1rem;text-align:center">
    <p style="letter-spacing:.08em;text-transform:uppercase;color:#c9a84c;font-weight:700;font-size:.875rem">Garden State AI</p>
    <h1 style="font-size:1.875rem;margin:.75rem 0 0">This listing is temporarily unavailable</h1>
    <p style="color:#4b5563;line-height:1.5">We couldn't load this property right now. Please try again in a few minutes.</p>
    <p><a href="/" style="color:#1a2332">Back to home</a></p>
  </main>
</body>
</html>`;
  return new NextResponse(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Retry-After": retryAfter,
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
