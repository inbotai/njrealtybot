import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTrainingCrawler } from "@/lib/crawler-policy";
import { INDEXNOW_KEY_PATH } from "@/lib/indexnow";

/**
 * Middleware: refuse AI training crawlers, then route by hostname.
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

export function middleware(req: NextRequest) {
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
    // Keep the key file on the matcher even if the pattern below changes.
    "/6f8a9d2e4b1c7f305a8e9c4d2b7f1a6e.txt",
    // Pages, API routes, and public files, including the favicon.
    // Skip Next.js build assets; those are not page content.
    "/((?!_next/static|_next/image).*)",
  ],
};
