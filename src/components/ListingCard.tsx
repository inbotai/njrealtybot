import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";

const statusColors: Record<string, string> = {
  "For Sale": "bg-green-600",
  Active: "bg-green-600",
  Sold: "bg-red-600",
  Pending: "bg-yellow-600",
};

export default function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.photos?.[0];
  const statusColor = statusColors[listing.status] || "bg-gray-600";

  return (
    <Link
      href={`/property/${generateSlug(listing)}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-gray-200">
        {photo ? (
          <Image
            src={photo}
            alt={formatAddress(listing)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Photo
          </div>
        )}
        <span
          className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white ${statusColor}`}
        >
          {listing.status}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xl font-bold text-navy">
          {formatPrice(listing.list_price)}
        </p>
        <p className="mt-1 text-sm text-gray-600 truncate">
          {formatAddress(listing)}
        </p>

        {/* Badges */}
        <div className="mt-3 flex gap-3 text-xs text-gray-500">
          {listing.bedrooms != null && (
            <span className="font-medium">{listing.bedrooms} Beds</span>
          )}
          {listing.bathrooms_full != null && (
            <span className="font-medium">{listing.bathrooms_full} Baths</span>
          )}
          {listing.living_area != null && (
            <span className="font-medium">
              {listing.living_area.toLocaleString()} Sqft
            </span>
          )}
        </div>

        {/* Compliance */}
        {listing.listing_office_name && (
          <p className="mt-2 truncate text-[10px] text-gray-400">
            Listed by {listing.listing_office_name}
          </p>
        )}
      </div>
    </Link>
  );
}
