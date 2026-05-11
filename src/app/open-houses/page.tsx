import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchOpenHouses } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";
import MLSDisclaimer from "@/components/MLSDisclaimer";

export const metadata: Metadata = {
  title: "Open Houses in New Jersey",
  description:
    "Browse upcoming open houses in New Jersey. Visit properties in person and find your dream home.",
};

export default async function OpenHousesPage() {
  let openHouses: Awaited<ReturnType<typeof fetchOpenHouses>> = [];
  try {
    openHouses = await fetchOpenHouses();
  } catch {
    /* API may be unavailable */
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="text-3xl font-bold text-navy">
          Upcoming Open Houses
        </h1>
        <p className="mt-2 text-gray-600">
          Visit properties in person. Find your next home this weekend.
        </p>

        {openHouses.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg font-medium">No upcoming open houses</p>
            <p className="mt-1 text-sm">Check back soon for new listings.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {openHouses.map((oh) => {
              const listing = oh.listing;
              if (!listing) return null;

              const photo = listing.photos?.[0];
              return (
                <Link
                  key={oh.id}
                  href={`/property/${generateSlug(listing)}`}
                  className="group block overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
                >
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
                    <div className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">
                      Open House
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-semibold text-gold">
                      {oh.date} &mdash; {oh.start_time} to {oh.end_time}
                    </p>
                    <p className="mt-1 text-xl font-bold text-navy">
                      {formatPrice(listing.list_price)}
                    </p>
                    <p className="mt-1 truncate text-sm text-gray-600">
                      {formatAddress(listing)}
                    </p>
                    <div className="mt-2 flex gap-3 text-xs text-gray-500">
                      {listing.bedrooms != null && (
                        <span>{listing.bedrooms} Beds</span>
                      )}
                      {listing.bathrooms_full != null && (
                        <span>{listing.bathrooms_full} Baths</span>
                      )}
                      {listing.living_area != null && (
                        <span>{listing.living_area.toLocaleString()} Sqft</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <MLSDisclaimer />
    </>
  );
}
