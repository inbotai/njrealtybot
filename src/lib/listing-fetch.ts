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
 * with `listing: null` (the Nov 2, 2026 database outage) and HTTP 503. Callers must
 * throw this rather than call notFound(), so Next.js does not store a 404 or an
 * error page over the last good ISR render.
 */
export class ListingUnavailableError extends Error {
  readonly retryAfter: number;

  constructor(message = "Listing temporarily unavailable", retryAfter = 60) {
    super(message);
    this.name = "ListingUnavailableError";
    this.retryAfter = retryAfter;
  }
}

/** Retry-After is either delta-seconds or an HTTP date. */
export function parseRetryAfter(value: string | null | undefined, now = Date.now()): number {
  if (!value) return 60;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Math.min(86400, Number(trimmed));
  const date = Date.parse(trimmed);
  if (Number.isFinite(date)) return Math.min(86400, Math.max(0, Math.ceil((date - now) / 1000)));
  return 60;
}

export function isListingNotFound(error: unknown): boolean {
  return error instanceof ListingNotFoundError || (error instanceof Error && error.name === "ListingNotFoundError");
}

export function isListingUnavailable(error: unknown): error is ListingUnavailableError {
  return error instanceof ListingUnavailableError || (error instanceof Error && error.name === "ListingUnavailableError");
}

export interface ListingPayload {
  listing: Listing;
  openHouses?: OpenHouse[];
  compliance?: Record<string, string>;
}

function isInvalidUuidBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const message = (body as { error?: unknown }).error;
  return typeof message === "string" && /invalid input syntax for type uuid/i.test(message);
}

function isListingRecord(value: unknown): value is Listing {
  if (!value || typeof value !== "object") return false;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0;
}

/**
 * Turn an upstream listing response into a payload or a typed error.
 * HTTP 404 is a confirmed miss. HTTP 503 (and any other failure, including a 200
 * with a null listing) is a transient failure. A 200 listing is usable even when
 * `X-Idx-Data: stale` — that header means the backend served a saved copy.
 */
export function listingFromResponse(
  status: number,
  body: unknown,
  retryAfter = 60,
): ListingPayload {
  if (status === 404 || isInvalidUuidBody(body)) throw new ListingNotFoundError();
  if (status < 200 || status >= 300) {
    throw new ListingUnavailableError(`Listing service returned HTTP ${status}`, retryAfter);
  }
  if (!body || typeof body !== "object" || !isListingRecord((body as { listing?: unknown }).listing)) {
    throw new ListingUnavailableError("Listing service returned an empty listing", retryAfter);
  }
  return body as ListingPayload;
}
