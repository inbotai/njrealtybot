export type ListingStatusTone = "sold" | "active" | "inactive";

/**
 * Sold and removed listings still render. The API's 404 is what becomes
 * notFound(); a status string is a label, including Sold, Removed,
 * Withdrawn, Expired, and Canceled.
 */
export function listingStatusPresentation(status: string | null | undefined): {
  label: string;
  tone: ListingStatusTone;
} {
  const label = (status || "").trim() || "Unknown";
  if (/^sold$/i.test(label)) return { label, tone: "sold" };
  if (/^(active|coming soon)$/i.test(label)) return { label, tone: "active" };
  return { label, tone: "inactive" };
}
