const IDX_API = "https://inbot-idx-api-production.up.railway.app";

export interface Listing {
  id: string;
  list_price: number;
  street_number: string;
  street_name: string;
  street_suffix: string;
  city: string;
  state: string;
  postal_code: string;
  county: string;
  bedrooms: number;
  bathrooms_full: number;
  bathrooms_half: number;
  living_area: number;
  lot_size_acres: number;
  year_built: number;
  property_type: string;
  status: string;
  public_remarks: string;
  photos: string[];
  listing_office_name: string;
  listing_agent_name: string;
  taxes: number;
  heating: string;
  cooling: string;
  garage_spaces: number;
  basement: string;
  pool: string;
  features: string[];
  open_houses: OpenHouse[];
}

export interface OpenHouse {
  id: string;
  listing_id: string;
  date: string;
  start_time: string;
  end_time: string;
  listing?: Listing;
}

export interface LeadData {
  full_name: string;
  email: string;
  phone: string;
  message: string;
  listing_id?: string;
  lead_type: "info_request" | "showing_request" | "listing_request";
}

export interface ListingsResponse {
  data: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchListings(
  params: Record<string, string>
): Promise<ListingsResponse> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${IDX_API}/api/idx/listings?${qs}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function fetchListing(id: string): Promise<Listing> {
  const res = await fetch(`${IDX_API}/api/idx/listings/${id}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch listing");
  return res.json();
}

export async function fetchAutocomplete(
  q: string
): Promise<{ label: string; value: string }[]> {
  const res = await fetch(`${IDX_API}/api/idx/autocomplete?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function submitLead(data: LeadData): Promise<{ success: boolean }> {
  const res = await fetch(`${IDX_API}/api/idx/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit lead");
  return res.json();
}

export async function fetchOpenHouses(): Promise<OpenHouse[]> {
  const res = await fetch(`${IDX_API}/api/idx/open-houses`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch open houses");
  const json = await res.json();
  return Array.isArray(json) ? json : json.data || [];
}
