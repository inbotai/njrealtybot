import Link from "next/link";
import type { Listing } from "@/lib/api";
import { getPhotoUrl } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";

const statusColors: Record<string, string> = {
  "For Sale": "bg-green-600",
  Active: "bg-green-600",
  Sold: "bg-red-600",
  Pending: "bg-yellow-600",
  "Under Contract": "bg-blue-600",
  "Coming Soon": "bg-purple-600",
};

const OUR_OFFICE = "REALTY ONE GROUP LEGEND";

function isOurListing(listing: Listing): boolean {
  return (listing.listing_office_name || "").toUpperCase().includes(OUR_OFFICE);
}

/** Determine which MLS logo to show based on mls_source_id */
function getMlsLogo(listing: Listing): { src: string; alt: string } | null {
  if (isOurListing(listing)) return null;
  // GSMLS source ID
  if (listing.mls_source_id === "e09b0ae1-6b61-401d-a5ee-2fa79d473f3e") {
    return { src: "/gsmls-logo.gif", alt: "GSMLS" };
  }
  return { src: "/njmls-idx-logo.jpg", alt: "NJMLS IDX" };
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.primary_photo_url || (listing.photo_count !== 0 ? getPhotoUrl(listing.mls_number) : null);
  const statusColor = statusColors[listing.mls_status] || "bg-gray-600";
  const mlsLogo = getMlsLogo(listing);

  return (
    <Link
      href={`/property/${generateSlug(listing)}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] bg-gray-200">
        {photo ? (
          <img
            src={photo}
            alt={formatAddress(listing)}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Photo
          </div>
        )}
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white ${statusColor}`}>
          {listing.mls_status}
        </span>
        {mlsLogo && (
          <img src={mlsLogo.src} alt={mlsLogo.alt} className="absolute bottom-2 right-2 h-6 w-auto opacity-90" />
        )}
      </div>

      <div className="p-4">
        <p className="text-xl font-bold text-navy">
          {listing.list_price ? formatPrice(listing.list_price) : "Price TBD"}
        </p>
        <p className="mt-1 text-sm text-gray-600 truncate">
          {formatAddress(listing)}
        </p>
        {listing.city && (
          <p className="text-xs text-gray-500">{listing.city}, {listing.state_or_province || "NJ"}</p>
        )}

        <div className="mt-3 flex gap-3 text-xs text-gray-500">
          {listing.bedrooms_total != null && (
            <span className="font-medium">{listing.bedrooms_total} Beds</span>
          )}
          {listing.bathrooms_total != null && (
            <span className="font-medium">{listing.bathrooms_total} Baths</span>
          )}
          {listing.living_area != null && listing.living_area > 100 && (
            <span className="font-medium">{listing.living_area.toLocaleString()} Sqft</span>
          )}
        </div>

        {listing.listing_office_name && (
          <p className="mt-2 truncate text-xs text-gray-500">
            Listed by {listing.listing_office_name}
          </p>
        )}
      </div>
    </Link>
  );
}
