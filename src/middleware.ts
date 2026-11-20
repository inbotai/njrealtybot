import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { INDEXNOW_KEY_PATH } from "@/lib/indexnow";
import { retryBackoffRemaining } from "@/lib/listing-cache";
import { listingOutageResponse, singleListingId } from "@/lib/unavailable-http";

/**
 * Middleware: route requests based on hostname.
 *
 * gardenstate.ai → AI services portal (valuations, staging, Vale, market)
 * idxlistings.gardenstate.ai → IDX property search with brokerage branding
 *
 * The IDX subdomain is detected by hostname and flagged via a cookie
 * that the client shell reads to swap Navbar/Footer/branding. Public ISR
 * pages are not in the matcher: a CDN hit must not invoke this function.
 * The shell also checks window.location.hostname, so a listing URL on the
 * IDX host still gets the brokerage chrome when this function does not run.
 */

const IDX_HOSTS = ["idxlistings.gardenstate.ai", "idxlistings.localhost"];

// Routes that ONLY exist on the IDX subdomain
const IDX_ONLY_ROUTES = ["/search", "/property", "/deals", "/open-houses"];

// Routes that ONLY exist on the main domain
const MAIN_ONLY_ROUTES = ["/staging", "/sell", "/admin"];

/**
 * True when this request needs a per-request decision (host routing, or a
 * listing URL that is not served as ISR). Static files, images, sitemap,
 * robots, and the public ISR pages return false and are left out of `config.matcher`.
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
  const host = req.headers.get("host") || "";
  const isIdx = IDX_HOSTS.some((h) => host.startsWith(h));
  const { pathname } = req.nextUrl;

  // IndexNow key file is a public text file. Never redirect or rewrite it.
  if (pathname === INDEXNOW_KEY_PATH) {
    return NextResponse.next();
  }

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

  // Listing HTML is excluded from the matcher, so a CDN hit never gets here
  // and never calls the listing API. If a listing path is matched again, only
  // an isolate already inside Retry-After spends the check. fetchListing then
  // fails closed without a new connection. A 429 falls through so ISR
  // stale-while-revalidate can serve the last HTML instead of replacing it.
  if (isDocumentGet(req)) {
    const listingId = singleListingId(pathname);
    if (listingId && retryBackoffRemaining() > 0) {
      const outage = await listingOutageResponse(listingId);
      if (outage?.headers.get("x-listing-rate-limited") === "1") {
        return NextResponse.next();
      }
      if (outage) return outage;
    }
  }

  // Host-only cookie on the IDX subdomain. The main site does not set a cookie,
  // so public HTML can stay cacheable. The cookie is not shared across hosts.
  const res = NextResponse.next();
  if (isIdx) {
    res.cookies.set("gsai_idx", "1", { path: "/", sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: [
    "/6f8a9d2e4b1c7f305a8e9c4d2b7f1a6e.txt",
    // Skip Next internals, API routes, any path with a file extension
    // (images, sitemap.xml, robots.txt, fonts), the MyHome Log shell, and
    // ISR pages. Those are served from the CDN without this function.
    "/((?!_next|api(?:/|$)|favicon\\.ico|.*\\..*|my-home/log(?:/|$)|property(?:/|$)|market(?:/|$)|property-tax(?:/|$)|listing(?:/|$)|open-house(?:/|$)).*)",
  ],
};
