const IDX_API = "https://inbot-idx-api-production.up.railway.app";

/**
 * Floor used only when the live count cannot be loaded.
 * Measured active inventory was 9,098 on 2026-10-18 via
 * GET /api/idx/listings (status defaults to Active).
 * Sold records are a separate total and are not part of this claim.
 */
export const ACTIVE_LISTING_FLOOR = 9000;

export function formatActiveCount(n: number | null | undefined): string {
  if (n && n > 0) return n.toLocaleString("en-US");
  return `${ACTIVE_LISTING_FLOOR.toLocaleString("en-US")}+`;
}

export function activeListingsSentence(n: number | null | undefined): string {
  if (n && n > 0) {
    return `${n.toLocaleString("en-US")} active MLS listings across New Jersey.`;
  }
  return `${ACTIVE_LISTING_FLOOR.toLocaleString("en-US")}+ active MLS listings across New Jersey.`;
}

export async function fetchActiveListingCount(): Promise<number | null> {
  try {
    const res = await fetch(`${IDX_API}/api/idx/listings?pageSize=1`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.total === "number" && data.total > 0 ? data.total : null;
  } catch {
    return null;
  }
}
