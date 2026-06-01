/**
 * Feature flags — flip when Broker of Record / IDX authorization is approved.
 *
 * IDX_PUBLIC_ENABLED = false  → buyer-side routes (/search, /property, /deals,
 *   /open-houses) are gated behind admin auth.  Public sees seller homepage.
 * IDX_PUBLIC_ENABLED = true   → buyer-side routes open to everyone (Phase 2).
 */
export const IDX_PUBLIC_ENABLED = false;
