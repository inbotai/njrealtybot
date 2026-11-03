import { cache } from "react";
import { unstable_cache } from "next/cache";
import { notFound, unstable_rethrow } from "next/navigation";
import { fetchListing, fetchListings } from "./api";
import {
  isListingNotFound,
  isListingUnavailable,
  ListingUnavailableError,
  type ListingPayload,
} from "./listing-fetch";
import { parseSlug } from "./utils";

export type CachedListing =
  | { ok: true; data: ListingPayload }
  | { ok: false; reason: "not_found" };

/**
 * Cache only a real listing or a confirmed miss.
 *
 * `fetchListing` uses `cache: "no-store"` so a HTTP 200 body of `{ listing: null }`
 * never enters Next's fetch cache (that cache stores 200 responses). This wrapper
 * stores the successful result for 5 minutes. A throw is not stored, and a stale
 * cached listing is kept when a refresh fails, so an outage cannot replace a good page.
 */
async function readListingForCache(id: string): Promise<CachedListing> {
  try {
    const data = await fetchListing(id);
    return { ok: true, data };
  } catch (error) {
    unstable_rethrow(error);
    if (isListingNotFound(error)) return { ok: false, reason: "not_found" };
    if (isListingUnavailable(error)) throw error;
    throw new ListingUnavailableError(error instanceof Error ? error.message : "listing fetch failed");
  }
}

const readCachedListing = unstable_cache(readListingForCache, ["idx-listing"], {
  revalidate: 300,
});

export const getCachedListing = cache((id: string) => readCachedListing(id));

/** Render a listing, 404 a confirmed miss, or throw when the service is down. */
export async function loadListingForPage(id: string): Promise<ListingPayload> {
  const cached = await getCachedListing(id);
  if (!cached.ok) notFound();
  return cached.data;
}

const UUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Open-house slugs are either `{uuid}-address` or a bare MLS number.
 * A degraded listing service throws. An empty search is a real miss.
 */
export async function resolveOpenHouseListing(slug: string): Promise<ListingPayload | null> {
  if (UUID_PREFIX.test(slug)) {
    const cached = await getCachedListing(parseSlug(slug));
    if (cached.ok) return cached.data;
  }

  let result;
  try {
    result = await fetchListings({ mls_number: slug, pageSize: "1" });
  } catch (error) {
    unstable_rethrow(error);
    throw new ListingUnavailableError(error instanceof Error ? error.message : "listing search failed");
  }

  const listings = result.listings || result.data || [];
  const id = listings[0]?.id;
  if (!id) return null;
  const cached = await getCachedListing(id);
  return cached.ok ? cached.data : null;
}
