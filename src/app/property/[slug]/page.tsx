import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchListing, fetchListings } from "@/lib/api";
import PhotoGallery from "@/components/PhotoGallery";
import { formatPrice, formatAddress, parseSlug } from "@/lib/utils";
import ListingCard from "@/components/ListingCard";
import PropertyPageVale from "@/components/PropertyPageVale";
import MLSDisclaimer from "@/components/MLSDisclaimer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseSlug(slug);
  try {
    const { listing } = await fetchListing(id);
    const address = formatAddress(listing);
    const price = listing.list_price ? formatPrice(listing.list_price) : "";
    const beds = listing.bedrooms_total ?? "?";
    const baths = listing.bathrooms_total ?? "?";
    const title = `${address} | ${beds} Beds ${baths} Baths | ${price} | NJ Realty Bot`;
    return {
      title,
      description: listing.public_remarks?.slice(0, 160) || `View details for ${address}`,
      openGraph: {
        title,
        description: listing.public_remarks?.slice(0, 160),
        images: listing.primary_photo_url ? [listing.primary_photo_url] : [],
      },
    };
  } catch {
    return { title: "Property Not Found" };
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const id = parseSlug(slug);

  let data;
  try {
    data = await fetchListing(id);
  } catch {
    notFound();
  }

  const { listing, openHouses = [], compliance } = data;
  const address = formatAddress(listing);
  const isSold = listing.mls_status === "Sold";

  // Similar properties
  let similar: import("@/lib/api").Listing[] = [];
  try {
    if (listing.city) {
      const res = await fetchListings({ city: listing.city, status: "Active", limit: "4" });
      similar = (res.data || []).filter((l) => l.id !== listing.id).slice(0, 4);
    }
  } catch { /* ignore */ }

  // ── Key details grid ──────────────────────────────────────
  const details = [
    { label: "Bedrooms", value: listing.bedrooms_total },
    { label: "Bathrooms", value: listing.bathrooms_total },
    { label: "Half Baths", value: listing.bathrooms_half },
    { label: "Sq Ft", value: listing.living_area?.toLocaleString() },
    { label: "Lot Size", value: listing.lot_size_area ? `${Number(listing.lot_size_area).toLocaleString()} sqft` : null },
    { label: "Year Built", value: listing.year_built },
    { label: "Stories", value: listing.stories },
    { label: "Property Type", value: [listing.property_type, listing.property_sub_type].filter(Boolean).join(" — ") || null },
    { label: "Parking Spaces", value: listing.parking_total },
    { label: "Garage", value: listing.garage_spaces },
  ].filter((d) => d.value != null);

  // ── Tax & Financial info ──────────────────────────────────
  const financials = [
    listing.tax_annual_amount != null && {
      label: "Annual Taxes",
      value: `${formatPrice(listing.tax_annual_amount)}${listing.tax_year ? ` (${listing.tax_year})` : ""}`,
    },
    listing.association_fee != null && listing.association_fee > 0 && {
      label: "HOA / Association Fee",
      value: `${formatPrice(listing.association_fee)}${listing.association_fee_frequency ? ` / ${listing.association_fee_frequency}` : ""}`,
    },
    listing.original_list_price != null && listing.original_list_price !== listing.list_price && {
      label: "Original List Price",
      value: formatPrice(listing.original_list_price),
    },
    isSold && listing.close_price != null && {
      label: "Sold Price",
      value: formatPrice(listing.close_price),
    },
    isSold && listing.close_date && {
      label: "Sold Date",
      value: new Date(listing.close_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    },
    listing.list_date && {
      label: "Listed",
      value: new Date(listing.list_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    },
  ].filter(Boolean) as { label: string; value: string }[];

  // ── Features from JSONB ───────────────────────────────────
  const feats = listing.features || {};
  const featureGroups: { title: string; items: string[] }[] = [];

  const interiorItems = [
    feats.heating && `Heating: ${feats.heating}`,
    feats.cooling && `Cooling: ${feats.cooling}`,
    feats.flooring && `Flooring: ${feats.flooring}`,
    feats.appliances && `Appliances: ${feats.appliances}`,
    feats.interior && `Interior: ${feats.interior}`,
    feats.basement && `Basement: ${feats.basement}`,
  ].filter(Boolean) as string[];
  if (interiorItems.length > 0) featureGroups.push({ title: "Interior", items: interiorItems });

  const exteriorItems = [
    feats.exterior && `Exterior: ${feats.exterior}`,
    feats.garage_parking && `Parking: ${feats.garage_parking}`,
    feats.pool && `Pool: ${feats.pool}`,
  ].filter(Boolean) as string[];
  if (exteriorItems.length > 0) featureGroups.push({ title: "Exterior", items: exteriorItems });

  const utilityItems = [
    feats.water && `Water: ${feats.water}`,
    feats.sewer && `Sewer: ${feats.sewer}`,
  ].filter(Boolean) as string[];
  if (utilityItems.length > 0) featureGroups.push({ title: "Utilities", items: utilityItems });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: address,
    url: `https://njrealtybot.com/property/${slug}`,
    description: listing.public_remarks,
    image: listing.primary_photo_url,
    offers: { "@type": "Offer", price: listing.list_price, priceCurrency: "USD" },
    address: {
      "@type": "PostalAddress",
      streetAddress: [listing.street_number, listing.street_name].filter(Boolean).join(" "),
      addressLocality: listing.city,
      addressRegion: listing.state_or_province,
      postalCode: listing.postal_code,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <PhotoGallery mlsNumber={listing.mls_number} photoCount={listing.photo_count} address={address}
          isSold={listing.mls_status === "Sold"} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Header: price, address, status */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-navy">
                  {listing.list_price ? formatPrice(listing.list_price) : "Price TBD"}
                </h1>
                <p className="mt-1 text-lg text-gray-600">{address}</p>
                <p className="mt-1 text-sm text-gray-400">MLS# {listing.mls_number}</p>
                {listing.mls_source_id === "e09b0ae1-6b61-401d-a5ee-2fa79d473f3e" ? (
                  <img src="/gsmls-logo.gif" alt="GSMLS" className="mt-2 h-6 w-auto" />
                ) : (
                  <img src="/njmls-idx-logo.jpg" alt="NJMLS IDX" className="mt-2 h-6 w-auto" />
                )}
              </div>
              <span className={`rounded-full px-4 py-1 text-sm font-bold text-white ${
                isSold ? "bg-red-600" : "bg-green-600"
              }`}>
                {listing.mls_status}
              </span>
            </div>

            {/* Key details grid */}
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

            {/* Tax & Financial Information */}
            {financials.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-navy">Tax &amp; Financial Information</h2>
                <div className="mt-3 rounded-lg bg-white shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {financials.map((f, i) => (
                        <tr key={f.label} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-4 py-3 font-semibold text-gray-700 w-1/3">{f.label}</td>
                          <td className="px-4 py-3 text-gray-600">{f.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Features — grouped by category */}
            {featureGroups.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-navy">Property Features</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featureGroups.map((group) => (
                    <div key={group.title} className="rounded-lg bg-white p-4 shadow-sm">
                      <h3 className="mb-2 text-sm font-bold text-navy">{group.title}</h3>
                      <ul className="space-y-1.5">
                        {group.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="mt-0.5 text-gold">&#10003;</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Directions */}
            {listing.directions && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-navy">Directions</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{listing.directions}</p>
              </div>
            )}

            {/* Open Houses */}
            {openHouses.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-navy">Open Houses</h2>
                <div className="mt-3 space-y-2">
                  {openHouses.map((oh) => (
                    <div key={oh.id} className="rounded-lg bg-gold/10 px-4 py-3 text-sm">
                      <strong>{oh.open_house_date}</strong> &mdash; {oh.start_time || "TBD"} to {oh.end_time || "TBD"}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listing broker/agent info */}
            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-700">Listing Information</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {listing.listing_office_name && (
                  <p><span className="font-semibold">Listing Office:</span> {listing.listing_office_name}
                    {listing.listing_office_phone ? ` — ${listing.listing_office_phone}` : ""}</p>
                )}
                {listing.listing_agent_name && (
                  <p><span className="font-semibold">Listing Agent:</span> {listing.listing_agent_name}
                    {listing.listing_agent_phone ? ` — ${listing.listing_agent_phone}` : ""}
                    {listing.listing_agent_email ? ` — ${listing.listing_agent_email}` : ""}</p>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Information deemed reliable but not guaranteed. Data provided for consumer&apos;s
                personal, non-commercial use only.
                {listing.mls_modification_timestamp && (
                  <> Last updated: {new Date(listing.mls_modification_timestamp).toLocaleDateString("en-US")}.</>
                )}
              </p>
            </div>
          </div>

          {/* Vale chat sidebar */}
          <div>
            <PropertyPageVale listingId={listing.id} />
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-navy">Similar Properties in {listing.city}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((l) => (<ListingCard key={l.id} listing={l} />))}
            </div>
          </section>
        )}
      </div>

      <MLSDisclaimer />
    </>
  );
}
