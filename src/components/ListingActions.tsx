"use client";

import { useAdmin } from "@/components/AdminAuth";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";

/** Favorite + Share buttons overlay on listing cards. Only visible to logged-in users. */
export default function ListingActions({ listingId, slug, address }: {
  listingId: string;
  slug: string;
  address: string;
}) {
  const { isAdmin } = useAdmin();
  if (!isAdmin) return null;

  return (
    <div className="absolute top-3 right-3 flex gap-1.5 z-10">
      <FavoriteButton listingId={listingId} size="sm" />
      <ShareButton url={`/property/${slug}`} title={address} size="sm" />
    </div>
  );
}
