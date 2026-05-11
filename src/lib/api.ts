const IDX_API = "https://inbot-idx-api-production.up.railway.app";

export interface Listing {
  id: string;
  mls_number: string;
  mls_status: string;
  property_type: string | null;
  list_price: number | null;
  street_number: string | null;
  street_name: string | null;
  city: string | null;
  state_or_province: string;
  postal_code: string | null;
  county: string | null;
  bedrooms_total: number | null;
  bathrooms_total: number | null;
  living_area: number | null;
  lot_size_area: number | null;
  year_built: number | null;
  listing_office_name: string | null;
  listing_agent_name: string | null;
  list_date: string | null;
  photo_count: number;
  primary_photo_url: string | null;
  unparsed_address: string | null;
  mls_modification_timestamp: string | null;
  latitude: number | null;
  longitude: number | null;
  // Detail-only fields
  public_remarks?: string | null;
  bathrooms_full?: number | null;
  bathrooms_half?: number | null;
  stories?: number | null;
  parking_total?: number | null;
  garage_spaces?: number | null;
  tax_annual_amount?: number | null;
  tax_year?: number | null;
  association_fee?: number | null;
  features?: Record<string, string>;
  listing_agent_phone?: string | null;
  listing_agent_email?: string | null;
  listing_office_phone?: string | null;
  original_list_price?: number | null;
  listing_photos?: ListingPhoto[];
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  mls_photo_url: string | null;
  stored_url: string | null;
  display_order: number;
  caption: string | null;
  is_primary: boolean;
}

export interface OpenHouse {
  id: string;
  listing_id: string;
  open_house_date: string;
  start_time: string | null;
  end_time: string | null;
  remarks: string | null;
  listings?: Partial<Listing>;
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
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  compliance: { disclaimer: string; lastUpdated: string; mlsName: string };
  // Aliases for compatibility
  data?: Listing[];
  totalPages?: number;
}

export async function fetchListings(
  params: Record<string, string>
): Promise<ListingsResponse> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${IDX_API}/api/idx/listings?${qs}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch listings");
  const json = await res.json();
  // Normalize: API returns { listings, total, page, pageSize }
  const pageSize = json.pageSize || 12;
  return {
    ...json,
    data: json.listings || json.data || [],
    totalPages: Math.ceil((json.total || 0) / pageSize),
  };
}

export async function fetchListing(id: string): Promise<{
  listing: Listing;
  openHouses: OpenHouse[];
  compliance: Record<string, string>;
}> {
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
  const json = await res.json();
  const results = json.results || json || [];
  return results.map((r: { type: string; value: string }) => ({
    label: `${r.value} (${r.type})`,
    value: r.value,
  }));
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
  return Array.isArray(json) ? json : json.openHouses || json.data || [];
}
