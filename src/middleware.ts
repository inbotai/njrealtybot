import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { INDEXNOW_KEY_PATH } from "@/lib/indexnow";
import { listingOutageResponse, singleListingId } from "@/lib/unavailable-http";

/**
 * Middleware: route requests based on hostname.
 *
 * gardenstate.ai → AI services portal (valuations, staging, Vale, market)
 * idxlistings.gardenstate.ai → IDX property search with brokerage branding
 *
 * The IDX subdomain is detected by hostname and flagged via a header
 * that the layout reads to swap Navbar/Footer/branding.
 */

const IDX_HOSTS = ["idxlistings.gardenstate.ai", "idxlistings.localhost"];

// Routes that ONLY exist on the IDX subdomain
const IDX_ONLY_ROUTES = ["/search", "/property", "/deals", "/open-houses"];

// Routes that ONLY exist on the main domain
const MAIN_ONLY_ROUTES = ["/staging", "/sell", "/admin"];

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

  // A full page load for one listing. 503 here is the never-cached outage response.
  // A found listing and a 404 fall through so the page can render or 404.
  if (isDocumentGet(req)) {
    const listingId = singleListingId(pathname);
    if (listingId) {
      const outage = await listingOutageResponse(listingId);
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
    "/((?!_next|api|favicon.ico|.*\\..*).*)",
  ],
};
