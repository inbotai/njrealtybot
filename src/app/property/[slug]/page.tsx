import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchListing, fetchListings } from "@/lib/api";
import { formatPrice, formatAddress, parseSlug } from "@/lib/utils";
import LeadForm from "@/components/LeadForm";
import ListingCard from "@/components/ListingCard";
import MLSDisclaimer from "@/components/MLSDisclaimer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseSlug(slug);
  try {
    const listing = await fetchListing(id);
    const address = formatAddress(listing);
    const price = formatPrice(listing.list_price);
    const title = `${address} | ${listing.bedrooms} Beds ${listing.bathrooms_full} Baths | ${price}`;
    return {
      title,
      description: listing.public_remarks?.slice(0, 160) || `View details for ${address}`,
      openGraph: {
        title,
        description: listing.public_remarks?.slice(0, 160),
        images: listing.photos?.[0] ? [listing.photos[0]] : [],
      },
    };
  } catch {
    return { title: "Property Not Found" };
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const id = parseSlug(slug);

  let listing;
  try {
    listing = await fetchListing(id);
  } catch {
    notFound();
  }

  const address = formatAddress(listing);
  const photos = listing.photos || [];

  // Similar properties
  let similar: import("@/lib/api").Listing[] = [];
  try {
    const res = await fetchListings({
      city: listing.city,
      status: "Active",
      limit: "4",
    });
    similar = (res.data || []).filter((l) => l.id !== listing.id).slice(0, 4);
  } catch {
    /* ignore */
  }

  const details = [
    { label: "Bedrooms", value: listing.bedrooms },
    { label: "Bathrooms", value: listing.bathrooms_full },
    { label: "Half Baths", value: listing.bathrooms_half },
    { label: "Sq Ft", value: listing.living_area?.toLocaleString() },
    { label: "Lot Size", value: listing.lot_size_acres ? `${listing.lot_size_acres} acres` : null },
    { label: "Year Built", value: listing.year_built },
    { label: "Property Type", value: listing.property_type },
    { label: "Taxes", value: listing.taxes ? formatPrice(listing.taxes) : null },
  ].filter((d) => d.value != null);

  const featureItems = [
    listing.heating && `Heating: ${listing.heating}`,
    listing.cooling && `Cooling: ${listing.cooling}`,
    listing.garage_spaces && `Garage: ${listing.garage_spaces} spaces`,
    listing.basement && `Basement: ${listing.basement}`,
    listing.pool && `Pool: ${listing.pool}`,
    ...(listing.features || []),
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: address,
    url: `https://njrealtybot.com/property/${slug}`,
    description: listing.public_remarks,
    image: photos[0],
    offers: {
      "@type": "Offer",
      price: listing.list_price,
      priceCurrency: "USD",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${listing.street_number} ${listing.street_name} ${listing.street_suffix}`.trim(),
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.postal_code,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Photo Gallery */}
        <div className="grid gap-2 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200">
            {photos[0] ? (
              <Image src={photos[0]} alt={address} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No Photo Available</div>
            )}
          </div>
          <div className="hidden gap-2 md:grid md:grid-cols-2">
            {photos.slice(1, 5).map((p, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200">
                <Image src={p} alt={`${address} photo ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-navy">{formatPrice(listing.list_price)}</h1>
                <p className="mt-1 text-lg text-gray-600">{address}</p>
              </div>
              <span className={`rounded-full px-4 py-1 text-sm font-bold text-white ${listing.status === "Sold" ? "bg-red-600" : "bg-green-600"}`}>
                {listing.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {details.map((d) => (
                <div key={d.label} className="rounded-lg bg-white p-4 text-center shadow-sm">
                  <p className="text-lg font-bold text-navy">{d.value}</p>
                  <p className="text-xs text-gray-500">{d.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.public_remarks && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-navy">Description</h2>
                <p className="mt-3 leading-relaxed text-gray-600">{listing.public_remarks}</p>
              </div>
            )}

            {/* Features */}
            {featureItems.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-navy">Features</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {featureItems.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gold">&#10003;</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Open Houses */}
            {listing.open_houses?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-navy">Open Houses</h2>
                <div className="mt-3 space-y-2">
                  {listing.open_houses.map((oh) => (
                    <div key={oh.id} className="rounded-lg bg-gold/10 px-4 py-3 text-sm">
                      <strong>{oh.date}</strong> &mdash; {oh.start_time} to {oh.end_time}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent / Office */}
            <div className="mt-8 rounded-lg bg-gray-100 p-4 text-xs text-gray-500">
              {listing.listing_agent_name && <p>Listing Agent: {listing.listing_agent_name}</p>}
              {listing.listing_office_name && <p>Listing Office: {listing.listing_office_name}</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LeadForm leadType="showing_request" listingId={listing.id} title="Schedule a Showing" />
            <LeadForm leadType="info_request" listingId={listing.id} title="Request Info" />
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-navy">Similar Properties in {listing.city}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>

      <MLSDisclaimer />
    </>
  );
}
