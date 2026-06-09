import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchListing, getPhotoUrl } from "@/lib/api";
import { formatPrice, formatAddress, parseSlug } from "@/lib/utils";
import MortgageCalculator from "@/components/MortgageCalculator";

export const maxDuration = 30;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseSlug(slug);
  try {
    const { listing } = await fetchListing(id);
    const address = formatAddress(listing);
    const price = listing.list_price ? formatPrice(listing.list_price) : "";
    return {
      title: `${address} | ${price}`,
      description: listing.public_remarks?.slice(0, 160) || `Property for sale: ${address}`,
      openGraph: {
        title: `${address} — ${price}`,
        description: listing.public_remarks?.slice(0, 160),
        images: listing.primary_photo_url ? [listing.primary_photo_url] : [],
      },
    };
  } catch { return { title: "Property Showcase" }; }
}

export default async function ShowcasePage({ params }: Props) {
  const { slug } = await params;
  const id = parseSlug(slug);

  let data;
  try { data = await fetchListing(id); } catch { notFound(); }

  const { listing, openHouses = [] } = data;
  const address = formatAddress(listing);
  const photoCount = listing.photo_count || 0;
  const photos = Array.from({ length: Math.min(photoCount, 20) }, (_, i) => getPhotoUrl(listing.mls_number, i));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero photo */}
      {photos.length > 0 && (
        <div className="relative h-[60vh] bg-gray-900">
          <img src={photos[0]} alt={address} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <p className="text-4xl font-bold">{listing.list_price ? formatPrice(listing.list_price) : "Contact for Price"}</p>
            <p className="mt-2 text-xl">{address}</p>
            <div className="mt-2 flex gap-4 text-lg">
              {listing.bedrooms_total && <span>{listing.bedrooms_total} Beds</span>}
              {listing.bathrooms_total && <span>{listing.bathrooms_total} Baths</span>}
              {listing.living_area && listing.living_area > 100 && <span>{listing.living_area.toLocaleString()} Sqft</span>}
              {listing.lot_size_area && <span>{listing.lot_size_area > 100 ? (listing.lot_size_area / 43560).toFixed(2) : listing.lot_size_area} Acres</span>}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Photo gallery */}
        {photos.length > 1 && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {photos.slice(1, 13).map((url, i) => (
              <img key={i} src={url} alt={`${address} photo ${i + 2}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
            ))}
          </div>
        )}

        {/* Description */}
        {listing.public_remarks && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">About This Home</h2>
            <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">{listing.public_remarks}</p>
          </section>
        )}

        {/* Details grid */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            {listing.year_built && <Detail label="Year Built" value={String(listing.year_built)} />}
            {listing.property_type && <Detail label="Type" value={listing.property_type} />}
            {listing.property_sub_type && <Detail label="Sub-type" value={listing.property_sub_type} />}
            {listing.tax_annual_amount && <Detail label="Annual Taxes" value={formatPrice(Number(listing.tax_annual_amount))} />}
            {listing.garage_spaces && <Detail label="Garage" value={`${listing.garage_spaces} spaces`} />}
            {listing.stories && <Detail label="Stories" value={String(listing.stories)} />}
            {listing.association_fee && <Detail label="HOA" value={`${formatPrice(Number(listing.association_fee))}/${listing.association_fee_frequency || "month"}`} />}
            {listing.features && Object.entries(listing.features).map(([k, v]) => (
              <Detail key={k} label={k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} value={String(v)} />
            ))}
          </dl>
        </section>

        {/* Open Houses */}
        {openHouses.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">Open House Schedule</h2>
            <div className="mt-4 space-y-3">
              {openHouses.map((oh: any, i: number) => (
                <div key={i} className="rounded-lg bg-gold/10 p-4">
                  <p className="font-semibold text-navy">{oh.open_house_date}</p>
                  {oh.start_time && oh.end_time && <p className="text-sm text-gray-600">{oh.start_time} – {oh.end_time}</p>}
                  {oh.remarks && <p className="text-sm text-gray-500">{oh.remarks}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mortgage Calculator */}
        {listing.list_price && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">Mortgage Estimate</h2>
            <div className="mt-4">
              <MortgageCalculator listPrice={listing.list_price} annualTaxes={listing.tax_annual_amount ? Number(listing.tax_annual_amount) : null} hoaMonthly={listing.association_fee ? Number(listing.association_fee) : null} />
            </div>
          </section>
        )}

        {/* Agent contact */}
        <section className="mt-10 rounded-2xl bg-navy p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Interested in This Property?</h2>
          <p className="mt-2 text-gray-300">Schedule a showing or ask a question — we respond in minutes.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="https://wa.me/12015281095" target="_blank" rel="noopener noreferrer"
              className="rounded-lg bg-[#25D366] px-6 py-3 font-bold text-white hover:bg-[#20bd5a]">
              Message on WhatsApp
            </a>
            <a href="tel:+12015281095" className="rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400">
              Call (201) 528-1095
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            {listing.listing_office_name && `Listed by ${listing.listing_office_name}`}
          </p>
        </section>

        <p className="mt-6 text-center text-[10px] text-gray-400">
          Powered by Garden State AI | gardenstate.ai
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded bg-gray-50 px-3 py-2">
      <dt className="text-gray-600">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
