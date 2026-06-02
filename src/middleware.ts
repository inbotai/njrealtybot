import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const isIdx = IDX_HOSTS.some((h) => host.startsWith(h));
  const { pathname } = req.nextUrl;

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

  // Tag the request with the subdomain flag so layout can read it
  const res = NextResponse.next();
  if (isIdx) {
    res.headers.set("x-idx-subdomain", "true");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
