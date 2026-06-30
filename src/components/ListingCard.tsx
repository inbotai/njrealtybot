"use client";

import Link from "next/link";
import type { Listing } from "@/lib/api";
import { getPhotoUrl } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";
import ListingActions from "@/components/ListingActions";
import { EstTotalMonthlyCost } from "@/components/TotalCostCard";

const statusColors: Record<string, string> = {
  "For Sale": "bg-green-600",
  Active: "bg-green-600",
  Sold: "bg-red-600",
  Pending: "bg-yellow-600",
  "Under Contract": "bg-blue-600",
  "Coming Soon": "bg-purple-600",
};

const OUR_OFFICE = "BETTER HOMES AND GARDENS";

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
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              // Try proxy fallback if primary_photo_url failed
              if (listing.primary_photo_url && img.src === listing.primary_photo_url && listing.photo_count) {
                img.src = getPhotoUrl(listing.mls_number);
                return;
              }
              // Retry with nocache to bypass negative cache
              if (listing.photo_count && !img.src.includes("nocache")) {
                img.src = `${getPhotoUrl(listing.mls_number)}?nocache=1`;
                return;
              }
              // Hide broken image, show placeholder
              img.style.display = "none";
              const placeholder = img.parentElement?.querySelector("[data-photo-fallback]") as HTMLElement | null;
              if (placeholder) placeholder.style.display = "flex";
            }}
          />
        ) : null}
        <div
          data-photo-fallback
          className="h-full w-full items-center justify-center text-gray-400"
          style={{ display: photo ? "none" : "flex" }}
        >
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </div>
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white ${statusColor}`}>
          {listing.mls_status}
        </span>
        <ListingActions listingId={listing.id} slug={generateSlug(listing)} address={formatAddress(listing)} />
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

        {listing.list_price && listing.list_price > 0 && listing.mls_status !== "Sold" && listing.property_type !== "Rental" && (
          <div className="mt-2">
            <EstTotalMonthlyCost
              listPrice={listing.list_price}
              annualTaxes={listing.tax_annual_amount}
              hoaMonthly={listing.association_fee ? Number(listing.association_fee) : null}
              hoaFrequency={listing.association_fee_frequency}
            />
          </div>
        )}

        {listing.listing_office_name && (
          <p className="mt-2 truncate text-xs text-gray-500">
            Listed by {listing.listing_office_name}
          </p>
        )}
      </div>
    </Link>
  );
}
