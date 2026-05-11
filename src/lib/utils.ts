import type { Listing } from "./api";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatAddress(listing: Listing): string {
  if (listing.unparsed_address) return listing.unparsed_address;
  const parts = [listing.street_number, listing.street_name].filter(Boolean).join(" ");
  return [parts, listing.city, listing.state_or_province, listing.postal_code].filter(Boolean).join(", ");
}

export function generateSlug(listing: Listing): string {
  const addr = (listing.unparsed_address || [listing.street_number, listing.street_name, listing.city, listing.state_or_province, listing.postal_code].filter(Boolean).join(" "))
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${listing.id}-${addr}`;
}

export function parseSlug(slug: string): string {
  // UUID is 36 chars
  return slug.substring(0, 36);
}
