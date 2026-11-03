import type { Listing } from "./api";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatAddress(listing: Listing): string {
  const street = listing.unparsed_address
    || [listing.street_number, listing.street_name].filter(Boolean).join(" ");
  return [street, listing.city, listing.state_or_province, listing.postal_code]
    .filter(Boolean).join(", ");
}

function finiteCount(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Bed and bath counts that are actually known. Missing counts are omitted. */
export function propertyListingFacts(listing: {
  bedrooms_total?: number | null;
  bathrooms_total?: number | null;
}): string {
  const parts: string[] = [];
  const beds = finiteCount(listing.bedrooms_total);
  const baths = finiteCount(listing.bathrooms_total);
  if (beds != null) parts.push(`${beds} Beds`);
  if (baths != null) parts.push(`${baths} Baths`);
  return parts.join(" ");
}

export function propertyListingTitle(listing: Listing): string {
  const price = listing.list_price ? formatPrice(listing.list_price) : "";
  return [formatAddress(listing), propertyListingFacts(listing), price].filter(Boolean).join(" | ");
}

export function propertyListingDescription(listing: Listing): string {
  const remarks = listing.public_remarks?.replace(/\s+/g, " ").trim();
  if (remarks) return remarks.slice(0, 160);
  const detail = [propertyListingFacts(listing), listing.list_price ? formatPrice(listing.list_price) : ""]
    .filter(Boolean)
    .join(" · ");
  const address = formatAddress(listing);
  return detail ? `View details for ${address}. ${detail}` : `View details for ${address}`;
}

export function generateSlug(listing: Listing): string {
  const street = listing.unparsed_address
    || [listing.street_number, listing.street_name].filter(Boolean).join(" ");
  const full = [street, listing.city, listing.state_or_province].filter(Boolean).join(" ");
  const slug = full.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${listing.id}-${slug}`;
}

export function parseSlug(slug: string): string {
  // UUID is 36 chars
  return slug.substring(0, 36);
}
