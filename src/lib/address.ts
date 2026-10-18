/** Split "36 Clark Ave, Bloomfield, NJ 07003" into street + city. */
export function splitStreetAndCity(input: string): { street: string; city: string } {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return { street: "", city: "" };
  if (parts.length === 1) return { street: parts[0], city: "" };

  const stripZip = (s: string) => s.replace(/\s*\d{5}(-\d{4})?\s*$/, "").trim();
  const isState = (s: string) => /^(nj|n\.j\.|new jersey)$/i.test(stripZip(s));
  const cleanCity = (s: string) => stripZip(s).replace(/\s+(nj|n\.j\.|new jersey)$/i, "").trim();

  if (isState(parts[parts.length - 1]) && parts.length >= 3) {
    return { street: parts[0], city: cleanCity(parts[parts.length - 2]) };
  }
  if (isState(parts[parts.length - 1])) {
    return { street: parts[0], city: "" };
  }
  return { street: parts[0], city: cleanCity(parts[1]) };
}
