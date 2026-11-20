/**
 * CDN lifetimes for public ISR pages.
 *
 * Vercel bills an ISR write when a regeneration produces different HTML, and
 * it bills function CPU for the rebuild. A 5-minute listing window was
 * rebuilding thousands of crawled URLs all day. These windows keep a price
 * or status change visible the same day (listings) or the next day (city
 * stats and the annual tax table).
 *
 * stale-while-revalidate lets the CDN keep serving the previous HTML while
 * one regeneration runs, so a refresh is not a visitor-facing cache miss.
 */

/** Listing and showcase pages. Was 5 minutes. */
export const LISTING_PAGE_REVALIDATE = 43_200;

/** Open-house sign-in pages. The event is same-day, so this is shorter than a listing. */
export const OPEN_HOUSE_PAGE_REVALIDATE = 21_600;

/** City market reports and the market index. Was 1 hour. */
export const MARKET_PAGE_REVALIDATE = 86_400;

/** Town tax-rate pages. The figures are the annual state table. */
export const TAX_PAGE_REVALIDATE = 86_400;

/** Static shells such as MyHome Log. The log itself loads in the browser. */
export const SHELL_PAGE_REVALIDATE = 86_400;

/** How long a stale CDN copy may be served after s-maxage while one refresh runs. */
export const CDN_STALE_WHILE_REVALIDATE = 604_800;

export function cdnCacheControl(
  sMaxAge: number,
  staleWhileRevalidate = CDN_STALE_WHILE_REVALIDATE,
): string {
  return `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}
