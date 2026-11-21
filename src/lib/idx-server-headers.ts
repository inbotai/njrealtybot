/**
 * Header zeus uses to exempt this server from per-IP limits.
 *
 * `IDX_SERVER_KEY` has no public prefix, so Next does not inline the value
 * into browser JavaScript. `fetchListing` / `fetchListings` are also called
 * from client components, and this module is imported by edge middleware, so
 * it cannot touch Node-only APIs. In the browser bundle `NEXT_RUNTIME` is
 * compiled to "" and the key read is dropped. The window check is the runtime
 * guarantee: a page call never attaches the header. Node tests leave
 * `NEXT_RUNTIME` unset, so they still read the env var.
 */
export function idxServerHeaders(): Record<string, string> {
  if (typeof globalThis.window !== "undefined" || process.env.NEXT_RUNTIME === "") return {};
  const key = process.env.IDX_SERVER_KEY?.trim();
  if (!key) return {};
  return { "x-idx-server-key": key };
}
