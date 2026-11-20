const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format a listing timestamp in UTC. The string depends only on the input,
 * so a regeneration does not write a new ISR entry just because the clock moved.
 * An unparseable value returns "" so callers can omit the line.
 */
export function formatUtcDate(value: string, style: "long" | "short" | "numeric" = "long"): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "";
  const date = new Date(parsed);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  if (style === "numeric") {
    return `${String(month + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
  }
  const name = (style === "short" ? MONTHS_SHORT : MONTHS_LONG)[month];
  return `${name} ${day}, ${year}`;
}
