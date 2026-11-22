import { cache } from "react";
import { unstable_cache } from "next/cache";
import { notFound, unstable_rethrow } from "next/navigation";
import { fetchListing, fetchListings } from "./api";
import { recallListing } from "./listing-cache";
import {
  isListingNotFound,
  isListingUnavailable,
  ListingUnavailableError,
  type ListingPayload,
} from "./listing-fetch";
import { LISTING_PAGE_REVALIDATE, OPEN_HOUSE_PAGE_REVALIDATE } from "./cache-policy";
import { isListingId, parseSlug } from "./utils";

export type CachedListing =
  | { ok: true; data: ListingPayload }
  | { ok: false; reason: "not_found" };

/**
 * Cache only a real listing or a confirmed miss.
 *
 * `fetchListing` uses `cache: "no-store"` so a HTTP 200 body of `{ listing: null }`
 * never enters Next's fetch cache (that cache stores 200 responses). This wrapper
 * stores the successful result for the listing page lifetime (12 hours). A throw is not stored, and a stale
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
  revalidate: LISTING_PAGE_REVALIDATE,
});

export const getCachedListing = cache((id: string) => readCachedListing(id));

/**
 * Read the ISR/data-cache entry. On a 429 or other transient error, return the
 * last good listing instead of failing the page. Throw only when nothing is cached
 * so a revalidation error does not replace a previously rendered route.
 */
async function listingOrStale(id: string): Promise<CachedListing> {
  try {
    return await getCachedListing(id);
  } catch (error) {
    unstable_rethrow(error);
    const stale = recallListing(id);
    if (stale && isListingUnavailable(error)) return { ok: true, data: stale };
    throw error;
  }
}

/** Render a listing, 404 a confirmed miss, or throw when the service is down and nothing is cached. */
export async function loadListingForPage(id: string): Promise<ListingPayload> {
  // A garbage slug is not a listing. The API answers that with a Postgres 500
  // ("invalid input syntax for type uuid"), which must not become an outage page.
  if (!isListingId(id)) notFound();
  const cached = await listingOrStale(id);
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
    const cached = await listingOrStale(parseSlug(slug));
    if (cached.ok) return cached.data;
  }

  let result;
  try {
    result = await fetchListings({ mls_number: slug, pageSize: "1" }, OPEN_HOUSE_PAGE_REVALIDATE);
  } catch (error) {
    unstable_rethrow(error);
    throw new ListingUnavailableError(error instanceof Error ? error.message : "listing search failed");
  }

  const listings = result.listings || result.data || [];
  const id = listings[0]?.id;
  if (!id) return null;
  const cached = await listingOrStale(id);
  return cached.ok ? cached.data : null;
}
