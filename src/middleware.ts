import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTrainingCrawler } from "@/lib/crawler-policy";
import { INDEXNOW_KEY_PATH } from "@/lib/indexnow";
import { retryBackoffRemaining } from "@/lib/listing-cache";
import { listingOutageResponse, singleListingId } from "@/lib/unavailable-http";

/**
 * Middleware: refuse AI training crawlers, then route by hostname.
 *
 * gardenstate.ai → AI services portal (valuations, staging, Vale, market)
 * idxlistings.gardenstate.ai → IDX property search with brokerage branding
 *
 * The IDX subdomain is detected by hostname and flagged via a cookie
 * that the client shell reads to swap Navbar/Footer/branding. Public ISR
 * pages do not get that cookie, so the CDN can keep storing their HTML.
 * The shell also checks window.location.hostname, so a listing URL on the
 * IDX host still gets the brokerage chrome.
 *
 * The matcher includes /property. ShapBot and other training crawlers were
 * fetching those pages and exhausting the listing API. A path-only matcher
 * cannot vary by user agent, so the 403 runs for every visitor and normal
 * requests continue. A listing id already inside Retry-After still takes
 * the per-id backoff check. Other ids are not blocked.
 */

const IDX_HOSTS = ["idxlistings.gardenstate.ai", "idxlistings.localhost"];

// Routes that ONLY exist on the IDX subdomain
const IDX_ONLY_ROUTES = ["/search", "/property", "/deals", "/open-houses"];

// Routes that ONLY exist on the main domain
const MAIN_ONLY_ROUTES = ["/staging", "/sell", "/admin"];

/**
 * Paths the hostname router handled before the crawler gate also covered
 * API routes and public files. Those extra paths stay out of host routing.
 */
export function isHostRoutedPath(pathname: string): boolean {
  const rest = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  if (rest.startsWith("_next") || rest.startsWith("api") || rest.startsWith("favicon.ico")) return false;
  if (rest.includes(".")) return false;
  return true;
}

/**
 * True when this request should take hostname routing and may set the IDX cookie.
 * Static files, API routes, and public ISR pages return false so those
 * responses are not given a Set-Cookie. The crawler gate still runs for
 * them: `config.matcher` is wider because it cannot vary by user agent.
 */
export function shouldRunMiddleware(pathname: string): boolean {
  if (pathname === INDEXNOW_KEY_PATH) return true;
  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/api" || pathname.startsWith("/api/")) return false;
  if (pathname === "/favicon.ico" || pathname.includes(".")) return false;
  if (pathname === "/my-home/log" || pathname === "/my-home/log/") return false;
  const skipped = ["/property", "/market", "/property-tax", "/listing", "/open-house"];
  if (skipped.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return false;
  return true;
}

function isDocumentGet(req: NextRequest): boolean {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  if (req.headers.get("rsc") === "1") return false;
  if (req.headers.get("next-router-prefetch")) return false;
  if (req.headers.get("next-router-segment-prefetch")) return false;
  return true;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // robots.txt states the policy and must stay readable to every agent.
  // The IndexNow key file is a public text file. Never redirect, rewrite, or block it.
  if (pathname === "/robots.txt" || pathname === INDEXNOW_KEY_PATH) {
    return NextResponse.next();
  }

  if (isTrainingCrawler(req.headers.get("user-agent"))) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Vary": "User-Agent",
      },
    });
  }

  if (!isHostRoutedPath(pathname)) {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";
  const isIdx = IDX_HOSTS.some((h) => host.startsWith(h));

  // IDX subdomain: block main-only routes
  if (isIdx && MAIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Main domain: block IDX-only routes for public (redirect to waitlist/home)
  // Note: this doesn't block admin-authenticated users — RequireAuth handles that
  if (!isIdx && IDX_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    // Let the request through — RequireAuth client component handles the gate
    // This allows admin users to still access these routes on the main domain
  }

  // Only a listing id already inside Retry-After spends this check.
  // Other ids still call zeus from the page. A 429 falls through so ISR
  // stale-while-revalidate can serve the last HTML instead of replacing it.
  if (isDocumentGet(req)) {
    const listingId = singleListingId(pathname);
    if (listingId && retryBackoffRemaining(listingId) > 0) {
      const outage = await listingOutageResponse(listingId);
      if (outage?.headers.get("x-listing-rate-limited") === "1") {
        return NextResponse.next();
      }
      if (outage) return outage;
    }
  }

  // Host-only cookie on the IDX subdomain, and not on ISR HTML. The main
  // site does not set a cookie, so public HTML can stay cacheable.
  const res = NextResponse.next();
  if (isIdx && shouldRunMiddleware(pathname)) {
    res.cookies.set("gsai_idx", "1", { path: "/", sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: [
    // Keep the key file on the matcher even if the pattern below changes.
    "/6f8a9d2e4b1c7f305a8e9c4d2b7f1a6e.txt",
    // Pages, API routes, and public files, including listing HTML and the favicon.
    // Skip Next.js build assets; those are not page content.
    "/((?!_next/static|_next/image).*)",
  ],
};
