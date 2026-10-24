/** Lowercase hyphenated URL slug for a New Jersey place name. */
export function cityToSlug(city: string): string {
  return city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** "fort-lee" -> "Fort Lee" for market API calls and headings. */
export function slugToCityName(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
