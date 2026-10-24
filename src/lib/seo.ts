import type { Metadata } from "next";

export const SITE_URL = "https://gardenstate.ai";

/** Self-referencing canonical. The homepage is the bare origin, without a trailing slash. */
export function pageCanonical(path: string): NonNullable<Metadata["alternates"]> {
  if (path === "/" || path === "") return { canonical: SITE_URL };
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return { canonical: `${SITE_URL}${normalized}` };
}
