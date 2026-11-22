/** Seconds to wait before each automatic reload of a property page that failed to load. */
export const LISTING_AUTO_RETRY_DELAYS_SEC = [20, 40, 80] as const;

export const LISTING_AUTO_RETRY_MAX = LISTING_AUTO_RETRY_DELAYS_SEC.length;

/** Delay for this zero-based attempt, or null when the automatic retries are used up. */
export function listingAutoRetryDelaySeconds(attempt: number): number | null {
  if (!Number.isInteger(attempt) || attempt < 0 || attempt >= LISTING_AUTO_RETRY_DELAYS_SEC.length) return null;
  return LISTING_AUTO_RETRY_DELAYS_SEC[attempt];
}
