import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://*.mlsmatrix.com/**"),
      new URL("https://*.paragonrels.com/**"),
      new URL("https://*.mlsgrid.com/**"),
      new URL("https://*.trestle.com/**"),
      new URL("https://*.photos.mlsgrid.com/**"),
    ],
  },
};

export default nextConfig;
