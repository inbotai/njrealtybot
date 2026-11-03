import type { Listing, OpenHouse } from "./api";

/**
 * The listing API confirmed this id does not exist (HTTP 404).
 * Callers should render notFound(). That 404 is a real result and may be cached.
 */
export class ListingNotFoundError extends Error {
  constructor(message = "Listing not found") {
    super(message);
    this.name = "ListingNotFoundError";
  }
}

/**
 * The listing API was unreachable or returned a degraded body, including HTTP 200
 * with `listing: null` (the Nov 2, 2026 database outage). Callers must throw this
 * rather than call notFound(), so Next.js does not store a 404 or an error page
 * over the last good ISR render.
 */
export class ListingUnavailableError extends Error {
  constructor(message = "Listing temporarily unavailable") {
    super(message);
    this.name = "ListingUnavailableError";
  }
}

export function isListingNotFound(error: unknown): boolean {
  return error instanceof ListingNotFoundError || (error instanceof Error && error.name === "ListingNotFoundError");
}

export function isListingUnavailable(error: unknown): boolean {
  return error instanceof ListingUnavailableError || (error instanceof Error && error.name === "ListingUnavailableError");
}

export interface ListingPayload {
  listing: Listing;
  openHouses?: OpenHouse[];
  compliance?: Record<string, string>;
}

function isListingRecord(value: unknown): value is Listing {
  if (!value || typeof value !== "object") return false;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0;
}

/**
 * Turn an upstream listing response into a payload or a typed error.
 * HTTP 404 is a confirmed miss. Any other failure, including a 200 with a null
 * listing, is a transient failure and must not be treated as a missing page.
 */
export function listingFromResponse(status: number, body: unknown): ListingPayload {
  if (status === 404) throw new ListingNotFoundError();
  if (status < 200 || status >= 300) {
    throw new ListingUnavailableError(`Listing service returned HTTP ${status}`);
  }
  if (!body || typeof body !== "object" || !isListingRecord((body as { listing?: unknown }).listing)) {
    throw new ListingUnavailableError("Listing service returned an empty listing");
  }
  return body as ListingPayload;
}
