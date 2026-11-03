"use client";

import "./globals.css";
import ListingUnavailableNotice from "@/components/ListingUnavailableNotice";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Temporarily unavailable</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <ListingUnavailableNotice onRetry={unstable_retry} />
      </body>
    </html>
  );
}
