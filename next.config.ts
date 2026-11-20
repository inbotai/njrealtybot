import type { NextConfig } from "next";
import {
  cdnCacheControl,
  LISTING_PAGE_REVALIDATE,
  MARKET_PAGE_REVALIDATE,
  OPEN_HOUSE_PAGE_REVALIDATE,
  SHELL_PAGE_REVALIDATE,
  TAX_PAGE_REVALIDATE,
} from "./src/lib/cache-policy";

function cdnHeaders(sMaxAge: number) {
  // CDN-Cache-Control / Vercel-CDN-Cache-Control tell the Vercel CDN the TTL
  // and include stale-while-revalidate so a refresh does not invoke the function
  // for every visitor. They are separate from the browser Cache-Control header
  // Next sets for ISR. Do not also set Cache-Control here: that can override Next's own header.
  const value = cdnCacheControl(sMaxAge);
  return [
    { key: "CDN-Cache-Control", value },
    { key: "Vercel-CDN-Cache-Control", value },
  ];
}

const nextConfig: NextConfig = {
  // NEVER expose source maps in production
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      new URL("https://*.mlsmatrix.com/**"),
      new URL("https://*.paragonrels.com/**"),
      new URL("https://*.mlsgrid.com/**"),
      new URL("https://*.trestle.com/**"),
      new URL("https://*.photos.mlsgrid.com/**"),
      // Municipal seals for news articles
      new URL("https://*.hackensack.org/**"),
      new URL("https://*.cliftonnj.org/**"),
      new URL("https://*.cityofpassaic.com/**"),
      new URL("https://*.elmwoodparknj.us/**"),
      new URL("https://*.wallingtonnj.org/**"),
      new URL("https://*.fairlawn.org/**"),
      new URL("https://*.eastrutherfordnj.net/**"),
    ],
  },

  // Remove x-powered-by header (don't advertise Next.js)
  poweredByHeader: false,

  // Redirect njrealtybot.com → gardenstate.ai (single domain, single brand)
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: "njrealtybot.com" }],
      destination: "https://gardenstate.ai/:path*",
      permanent: true,
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.njrealtybot.com" }],
      destination: "https://gardenstate.ai/:path*",
      permanent: true,
    },
  ],

  headers: async () => [
    {
      source: "/property/:path*",
      headers: cdnHeaders(LISTING_PAGE_REVALIDATE),
    },
    {
      source: "/listing/:path*",
      headers: cdnHeaders(LISTING_PAGE_REVALIDATE),
    },
    {
      source: "/open-house/:path*",
      headers: cdnHeaders(OPEN_HOUSE_PAGE_REVALIDATE),
    },
    {
      source: "/market",
      headers: cdnHeaders(MARKET_PAGE_REVALIDATE),
    },
    {
      source: "/market/:path*",
      headers: cdnHeaders(MARKET_PAGE_REVALIDATE),
    },
    {
      source: "/property-tax",
      headers: cdnHeaders(TAX_PAGE_REVALIDATE),
    },
    {
      source: "/property-tax/:path*",
      headers: cdnHeaders(TAX_PAGE_REVALIDATE),
    },
    {
      source: "/my-home/log",
      headers: cdnHeaders(SHELL_PAGE_REVALIDATE),
    },
    {
      source: "/6f8a9d2e4b1c7f305a8e9c4d2b7f1a6e.txt",
      headers: [
        { key: "Content-Type", value: "text/plain; charset=utf-8" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
    {
      source: "/(.*)",
      headers: [
        // Prevent embedding in iframes by competitors
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        // Prevent MIME sniffing
        { key: "X-Content-Type-Options", value: "nosniff" },
        // Referrer policy — don't leak full URLs to other sites
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
