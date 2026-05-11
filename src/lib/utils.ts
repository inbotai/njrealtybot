import type { Listing } from "./api";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatAddress(listing: Listing): string {
  const parts = [
    listing.street_number,
    listing.street_name,
    listing.street_suffix,
  ]
    .filter(Boolean)
    .join(" ");
  return `${parts}, ${listing.city}, ${listing.state} ${listing.postal_code}`;
}

export function generateSlug(listing: Listing): string {
  const address = [
    listing.street_number,
    listing.street_name,
    listing.street_suffix,
    listing.city,
    listing.state,
    listing.postal_code,
  ]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
  return `${listing.id}-${address}`;
}

export function parseSlug(slug: string): string {
  return slug.split("-")[0];
}
