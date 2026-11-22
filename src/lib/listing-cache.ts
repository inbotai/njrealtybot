import type { ListingPayload } from "./listing-fetch";

/**
 * Last good listing plus a per-id Retry-After window from a 429.
 *
 * The Full Route Cache (ISR, `revalidate` + stale-while-revalidate) is what
 * serves HTML across instances. This map covers the same Node isolate: a 429
 * or other transient failure can still return the listing fetched moments ago.
 * Backoff is per listing id. One 429 must not skip the upstream call for every
 * other id — zeus can still serve those from its own cache.
 */
const listings = new Map<string, ListingPayload>();
const backoffUntilById = new Map<string, number>();

export function rememberListing(id: string, payload: ListingPayload): void {
  listings.set(id, payload);
}

export function recallListing(id: string): ListingPayload | null {
  return listings.get(id) ?? null;
}

/** Extend the quiet period for this listing id. A shorter Retry-After must not shrink a longer one. */
export function noteRetryBackoff(id: string, retryAfterSeconds: number, now = Date.now()): void {
  const seconds = Math.min(86400, Math.max(0, Math.ceil(retryAfterSeconds)));
  const until = now + seconds * 1000;
  const current = backoffUntilById.get(id) ?? 0;
  if (until > current) backoffUntilById.set(id, until);
}

/** Seconds to wait before calling the listing API for this id. Zero means send the request. */
export function retryBackoffRemaining(id: string, now = Date.now()): number {
  const until = backoffUntilById.get(id) ?? 0;
  if (now >= until) {
    if (until !== 0) backoffUntilById.delete(id);
    return 0;
  }
  return Math.max(1, Math.ceil((until - now) / 1000));
}

export function resetListingCache(): void {
  listings.clear();
  backoffUntilById.clear();
}
