"use client";

import ListingUnavailableNotice from "@/components/ListingUnavailableNotice";

export default function ShowcaseError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <>
      <title>Listing temporarily unavailable</title>
      <meta name="robots" content="noindex, nofollow" />
      <ListingUnavailableNotice
        onRetry={unstable_retry}
        heading="This listing is temporarily unavailable"
        detail="We couldn't load this property right now. Please try again in a few minutes."
      />
    </>
  );
}
