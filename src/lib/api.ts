const IDX_API = "https://inbot-idx-api-production.up.railway.app";

/** Build photo URL for a listing via the MLS proxy */
export function getPhotoUrl(mlsNumber: string, index = 0): string {
  return `${IDX_API}/api/idx/photos/${mlsNumber}/${index}`;
}

/** Discover real photo count via RETS (L_PictureCount is unreliable) */
export async function fetchPhotoCount(mlsNumber: string): Promise<number> {
  try {
    const res = await fetch(`${IDX_API}/api/idx/photos/${mlsNumber}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return json.count || 0;
  } catch { return 0; }
}

export interface Listing {
  id: string;
  mls_number: string;
  mls_status: string;
  mls_source_id?: string;
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
  association_fee_frequency?: string | null;
  features?: Record<string, string>;
  listing_agent_phone?: string | null;
  listing_agent_email?: string | null;
  listing_office_phone?: string | null;
  original_list_price?: number | null;
  close_price?: number | null;
  close_date?: string | null;
  property_sub_type?: string | null;
  directions?: string | null;
  listing_photos?: ListingPhoto[];
  public_records?: {
    tax_annual?: number;
    assessed_value?: number;
    land_assessment?: number;
    improvement_value?: number;
    lot_acres?: number;
    lot_sqft?: number;
    year_built?: number;
    building_description?: string;
    last_sale_price?: number;
    property_class?: string;
    county?: string;
  } | null;
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
  email?: string;
  phone: string;
  message: string;
  listing_id?: string;
  lead_type: "info_request" | "showing_request" | "listing_request" | "buyer_waitlist" | "open_house_visitor";
  source?: string;
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
    signal: AbortSignal.timeout(8000),
  } as any);
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

// ── Intelligence API ────────────────────────────────────────

export interface DemandSignal {
  listingId: string;
  totalViews: number;
  uniqueVisitors: number;
  viewsLast24h: number;
  demandLevel: "low" | "moderate" | "high" | "very_high";
  competitionWarning: string | null;
  biddingWarProbability: number;
}

export interface DealOpportunity {
  listingId: string;
  mlsNumber: string;
  address: string;
  city: string;
  listPrice: number;
  predictedDrop: number;
  predictedPrice: number;
  probability: number;
  signals: string[];
  daysOnMarket: number;
}

export interface PricingEstimate {
  estimatedValue: number;
  lowRange: number;
  highRange: number;
  pricePerSqft: number;
  confidence: string;
  comparables: number;
  methodology: string;
}

/** Record a listing view + get demand signals */
export async function recordAndGetDemand(listingId: string, visitorId?: string): Promise<DemandSignal> {
  // Fire-and-forget view recording
  fetch(`${IDX_API}/api/idx/listings/${listingId}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId }),
  }).catch(() => {});
  // Get demand
  const res = await fetch(`${IDX_API}/api/idx/listings/${listingId}/demand`);
  if (!res.ok) return { listingId, totalViews: 0, uniqueVisitors: 0, viewsLast24h: 0, demandLevel: "low", competitionWarning: null, biddingWarProbability: 0 };
  return res.json();
}

/** Get deals / tunneling opportunities (sales + rentals) */
export async function fetchDeals(city?: string, limit = 10): Promise<{ deals: DealOpportunity[]; rentalDeals: DealOpportunity[] }> {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  params.set("limit", String(limit));
  params.set("type", "all");
  const res = await fetch(`${IDX_API}/api/idx/deals?${params}`);
  if (!res.ok) return { deals: [], rentalDeals: [] };
  const json = await res.json();
  return { deals: json.deals || [], rentalDeals: json.rentalDeals || [] };
}

/** Get personalized recommendations */
export async function fetchRecommendations(visitorId: string, limit = 6): Promise<{ id: string; score: number; address: string; price: number }[]> {
  const res = await fetch(`${IDX_API}/api/idx/recommendations?visitorId=${visitorId}&limit=${limit}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.recommendations || [];
}

/** Get match score for a listing */
export async function fetchMatchScore(visitorId: string, listingId: string): Promise<number> {
  const res = await fetch(`${IDX_API}/api/idx/match-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId, listingId }),
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.score || 0;
}

/** Get pricing estimate */
export async function fetchPricingEstimate(params: {
  city: string; bedrooms?: number; bathrooms?: number; sqft?: number; yearBuilt?: number;
}): Promise<PricingEstimate | null> {
  const res = await fetch(`${IDX_API}/api/idx/pricing/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) return null;
  return res.json();
}

/** Fetch market report for a city */
export async function fetchMarketReport(city: string): Promise<any> {
  const res = await fetch(`${IDX_API}/api/idx/market/${encodeURIComponent(city)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Fetch list of cities with market data */
export async function fetchMarketCities(): Promise<{ city: string; count: number }[]> {
  const res = await fetch(`${IDX_API}/api/idx/market-cities`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.cities || [];
}

/** Transcribe audio via Grok STT */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.webm");
  const res = await fetch(`${IDX_API}/api/idx/transcribe`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) return "";
  const data = await res.json();
  return data.text || "";
}

/** AI-powered search query parser */
export async function parseSearchQuery(q: string): Promise<{
  city?: string; county?: string; beds?: number; baths?: number;
  minPrice?: number; maxPrice?: number; propertyType?: string; q?: string;
}> {
  try {
    const res = await fetch(`${IDX_API}/api/idx/parse-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q }),
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

/** Generate CMA report */
export async function fetchCMA(city: string, beds?: number): Promise<string> {
  const res = await fetch(`${IDX_API}/api/idx/cma`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, beds }),
  });
  if (!res.ok) return "Unable to generate CMA for this area.";
  const json = await res.json();
  return json.report || "";
}

// ── Blog API ────────────────────────────────────────────────

export interface BlogPostAPI {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  content_html?: string;
  category: string;
  tags: string[];
  cover_image: string;
  reading_time: number;
  author: string;
  author_role: string | null;
  status?: string;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
  article_type?: string | null;
  town?: string | null;
  county?: string | null;
  fair_housing_flag?: boolean;
}

export async function fetchBlogPosts(filters?: {
  town?: string;
  articleType?: string;
}): Promise<BlogPostAPI[]> {
  try {
    const params = new URLSearchParams({ limit: "50" });
    if (filters?.town) params.set("town", filters.town);
    if (filters?.articleType) params.set("article_type", filters.articleType);
    const res = await fetch(`${IDX_API}/api/idx/blog/posts?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.posts || [];
  } catch { return []; }
}

export async function fetchBlogPost(slug: string): Promise<BlogPostAPI | null> {
  try {
    const res = await fetch(`${IDX_API}/api/idx/blog/posts/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
