import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchListing, fetchListings, getPhotoUrl } from "@/lib/api";
import { formatPrice, formatAddress, parseSlug } from "@/lib/utils";
import OpenHouseForm from "@/components/OpenHouseForm";
import MLSDisclaimer from "@/components/MLSDisclaimer";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Resolve a listing from the slug.
 * The slug can be:
 *   1. A standard listing slug (UUID-address)
 *   2. An MLS number (e.g., "2518234")
 */
async function resolveListing(slug: string) {
  // Try as standard slug first (UUID prefix)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  if (uuidPattern.test(slug)) {
    const id = parseSlug(slug);
    try {
      const data = await fetchListing(id);
      return data;
    } catch {
      /* fall through */
    }
  }

  // Try as MLS number — search for it
  try {
    const result = await fetchListings({ mls_number: slug, pageSize: "1" });
    const listings = result.listings || result.data || [];
    if (listings.length > 0) {
      const data = await fetchListing(listings[0].id);
      return data;
    }
  } catch {
    /* fall through */
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await resolveListing(slug);

  if (!data) {
    return { title: "Open House Sign-In" };
  }

  const { listing } = data;
  const address = formatAddress(listing);
  const price = listing.list_price ? formatPrice(listing.list_price) : "";

  return {
    title: `Open House: ${address}`,
    description: `Sign in to the open house at ${address}. ${price}. Get listing details, market reports, and similar home alerts.`,
    openGraph: {
      title: `Open House: ${address}`,
      description: `Sign in at ${address}. ${price}. Get listing details sent to your phone.`,
      type: "website",
    },
    robots: { index: false, follow: false },
  };
}

export default async function OpenHouseLandingPage({ params }: Props) {
  const { slug } = await params;
  const data = await resolveListing(slug);

  if (!data) {
    notFound();
  }

  const { listing } = data;
  const address = formatAddress(listing);
  const photo = listing.primary_photo_url
    || (listing.photo_count !== 0 ? getPhotoUrl(listing.mls_number) : null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero property photo */}
      <div className="relative h-48 sm:h-64 bg-navy">
        {photo ? (
          <img
            src={photo}
            alt={address}
            className="h-full w-full object-cover opacity-90"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.5L12 4l9 5.5M4 10v8a1 1 0 001 1h14a1 1 0 001-1v-8" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Property info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy mb-2">
            Open House
          </div>
          {listing.list_price && (
            <p className="text-2xl font-bold text-white">
              {formatPrice(listing.list_price)}
            </p>
          )}
          <p className="text-sm text-white/90 mt-0.5">{address}</p>
        </div>
      </div>

      {/* Property quick stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex justify-center gap-6 text-sm text-gray-700">
            {listing.bedrooms_total != null && (
              <div className="text-center">
                <span className="font-bold text-navy">{listing.bedrooms_total}</span>
                <span className="ml-1 text-gray-500">Beds</span>
              </div>
            )}
            {listing.bathrooms_total != null && (
              <div className="text-center">
                <span className="font-bold text-navy">{listing.bathrooms_total}</span>
                <span className="ml-1 text-gray-500">Baths</span>
              </div>
            )}
            {listing.living_area != null && (
              <div className="text-center">
                <span className="font-bold text-navy">{listing.living_area.toLocaleString()}</span>
                <span className="ml-1 text-gray-500">Sqft</span>
              </div>
            )}
            {listing.year_built != null && (
              <div className="text-center">
                <span className="font-bold text-navy">{listing.year_built}</span>
                <span className="ml-1 text-gray-500">Built</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration form */}
      <div className="mx-auto max-w-lg px-4 py-6">
        <OpenHouseForm listingId={listing.id} mlsNumber={listing.mls_number} />

        {/* Branding */}
        <div className="mt-6 text-center">
          <img
            src="/bhg-logo-green.png"
            alt="Better Homes and Gardens Real Estate"
            className="mx-auto h-10 w-auto opacity-60"
          />
          <p className="mt-2 text-xs text-gray-400">
            Powered by GardenState.ai
          </p>
        </div>
      </div>

      <MLSDisclaimer />
    </div>
  );
}
