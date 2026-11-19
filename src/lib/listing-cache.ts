import type { ListingPayload } from "./listing-fetch";

/**
 * Last good listing plus the Retry-After window from a 429.
 *
 * The Full Route Cache (ISR, `revalidate` + stale-while-revalidate) is what
 * serves HTML across instances. This map covers the same Node isolate: a 429
 * or other transient failure can still return the listing fetched moments ago,
 * and further upstream calls wait out `retryAfter` instead of extending the burst.
 */
const listings = new Map<string, ListingPayload>();
let backoffUntilMs = 0;

export function rememberListing(id: string, payload: ListingPayload): void {
  listings.set(id, payload);
}

export function recallListing(id: string): ListingPayload | null {
  return listings.get(id) ?? null;
}

/** Extend the quiet period. A shorter Retry-After must not shrink a longer one. */
export function noteRetryBackoff(retryAfterSeconds: number, now = Date.now()): void {
  const seconds = Math.min(86400, Math.max(0, Math.ceil(retryAfterSeconds)));
  const until = now + seconds * 1000;
  if (until > backoffUntilMs) backoffUntilMs = until;
}

/** Seconds to wait before calling the listing API again. Zero means send the request. */
export function retryBackoffRemaining(now = Date.now()): number {
  if (now >= backoffUntilMs) return 0;
  return Math.max(1, Math.ceil((backoffUntilMs - now) / 1000));
}

export function resetListingCache(): void {
  listings.clear();
  backoffUntilMs = 0;
}
