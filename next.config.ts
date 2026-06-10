import type { NextConfig } from "next";

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

  headers: async () => [
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
