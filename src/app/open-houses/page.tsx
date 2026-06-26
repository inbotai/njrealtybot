import type { Metadata } from "next";
import Link from "next/link";
import { fetchOpenHouses } from "@/lib/api";
import { formatPrice, formatAddress, generateSlug } from "@/lib/utils";
import MLSDisclaimer from "@/components/MLSDisclaimer";
import RequireAuth from "@/components/RequireAuth";
import type { Listing } from "@/lib/api";

export const metadata: Metadata = {
  title: { absolute: "Open Houses This Weekend in New Jersey | Garden State AI" },
  description:
    "Browse all open houses happening this weekend across New Jersey. Filter by city, price, and property type. See photos and details before you go.",
  keywords: [
    "open houses NJ this weekend",
    "open houses New Jersey",
    "NJ open house listings",
    "open house schedule NJ",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/open-houses",
  },
  openGraph: {
    type: "website",
    title: "Open Houses This Weekend in New Jersey | Garden State AI",
    description:
      "Browse all open houses happening this weekend across New Jersey. Filter by city, price, and property type. See photos and details before you go.",
    url: "https://gardenstate.ai/open-houses",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Houses This Weekend in New Jersey | Garden State AI",
    description:
      "Browse all open houses happening this weekend across New Jersey. Filter by city, price, and property type. See photos and details before you go.",
  },
};

export default async function OpenHousesPage() {
  let openHouses: Awaited<ReturnType<typeof fetchOpenHouses>> = [];
  try {
    openHouses = await fetchOpenHouses();
  } catch {
    /* API may be unavailable */
  }

  return (
    <RequireAuth>
    <>
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="text-3xl font-bold text-navy">Upcoming Open Houses</h1>
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
              const listing = oh.listings as Partial<Listing> | undefined;
              if (!listing) return null;

              return (
                <Link
                  key={oh.id}
                  href={listing.id ? `/property/${generateSlug(listing as Listing)}` : "#"}
                  className="group block overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] bg-gray-200">
                    {listing.primary_photo_url ? (
                      <img
                        src={listing.primary_photo_url}
                        alt={listing.unparsed_address || "Property"}
                        className="h-full w-full object-cover transition group-hover:scale-105"
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
                      {oh.open_house_date} &mdash; {oh.start_time || "TBD"} to {oh.end_time || "TBD"}
                    </p>
                    {listing.list_price && (
                      <p className="mt-1 text-xl font-bold text-navy">
                        {formatPrice(listing.list_price)}
                      </p>
                    )}
                    <p className="mt-1 truncate text-sm text-gray-600">
                      {listing.unparsed_address || "Address TBD"}
                    </p>
                    <div className="mt-2 flex gap-3 text-xs text-gray-500">
                      {listing.bedrooms_total != null && <span>{listing.bedrooms_total} Beds</span>}
                      {listing.bathrooms_total != null && <span>{listing.bathrooms_total} Baths</span>}
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
    </RequireAuth>
  );
}
