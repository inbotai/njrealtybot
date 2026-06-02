/**
 * Feature flags — flip when Broker of Record / IDX authorization is approved.
 *
 * IDX_PUBLIC_ENABLED = false  → buyer-side routes (/search, /property, /deals,
 *   /open-houses) are gated behind admin auth.  Public sees seller homepage.
 * IDX_PUBLIC_ENABLED = true   → buyer-side routes open to everyone (Phase 2).
 *
 * IDX_SUBDOMAIN → when set, property search queries redirect to this subdomain
 *   instead of /search. The subdomain will carry the brokerage branding.
 *   gardenstate.ai = AI services portal (valuations, staging, Vale, market reports)
 *   idxlistings.gardenstate.ai = IDX property search with brokerage branding
 */
export const IDX_PUBLIC_ENABLED = false;

/**
 * IDX subdomain for property listings.
 * Set to "" while IDX is private. When ready:
 *   IDX_SUBDOMAIN = "https://idxlistings.gardenstate.ai"
 */
export const IDX_SUBDOMAIN = "";
