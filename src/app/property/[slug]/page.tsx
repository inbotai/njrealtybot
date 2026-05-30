import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchListing, fetchListings, fetchPhotoCount } from "@/lib/api";
import PhotoGallery from "@/components/PhotoGallery";
import { formatPrice, formatAddress, parseSlug } from "@/lib/utils";
import ListingCard from "@/components/ListingCard";
import PropertyPageVale from "@/components/PropertyPageVale";
import MortgageCalculator from "@/components/MortgageCalculator";
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
    const title = `${address} | ${beds} Beds ${baths} Baths | ${price} | Garden State AI`;
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

  // Days on market
  const daysOnMarket = listing.list_date
    ? Math.floor((Date.now() - new Date(listing.list_date).getTime()) / 86400_000) : null;
  // Price reduced?
  const priceReduced = listing.original_list_price && listing.list_price
    && listing.original_list_price > listing.list_price;
  const priceDropPct = priceReduced
    ? Math.round((listing.original_list_price! - listing.list_price!) / listing.original_list_price! * 100) : 0;

  // Fetch photo count + similar properties in PARALLEL (not sequential)
  // AI estimate is NOT fetched server-side — it uses ScraperAPI which takes 20-40s
  // Instead, use list_price as the value reference (instant)
  const estValue = listing.list_price || 0;
  const estMonthlyRent = estValue > 0 ? Math.round(estValue * 0.006) : null;
  // AI estimate fetched on-demand (CMA), not on page load (was 20-40s via ScraperAPI)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiEstimate: any = null;

  const [realPhotoCount, similarRes] = await Promise.all([
    fetchPhotoCount(listing.mls_number),
    listing.city
      ? fetchListings({ city: listing.city, status: "Active", limit: "5" }).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
  ]);

  let similar: import("@/lib/api").Listing[] = [];
  try {
    similar = (similarRes.data || []).filter((l: any) => l.id !== listing.id).slice(0, 4);
  } catch { /* ignore */ }

  // ── Public records enrichment ──────────────────────────────
  const pr = listing.public_records;

  // ── Key details grid ──────────────────────────────────────
  const validSqft = listing.living_area && listing.living_area >= 200 ? listing.living_area : null;
  const lotSqft = (listing.lot_size_area && listing.lot_size_area >= 100 ? listing.lot_size_area : null) || pr?.lot_sqft;
  const lotDisplay = pr?.lot_acres
    ? `${pr.lot_acres} acres (${Number(pr.lot_sqft).toLocaleString()} sqft)`
    : lotSqft ? `${Number(lotSqft).toLocaleString()} sqft` : null;

  const details = [
    { label: "Bedrooms", value: listing.bedrooms_total },
    { label: "Bathrooms", value: listing.bathrooms_total },
    { label: "Half Baths", value: listing.bathrooms_half },
    { label: "Sq Ft", value: validSqft ? validSqft.toLocaleString() : null },
    { label: "Lot Size", value: lotDisplay },
    { label: "Year Built", value: listing.year_built },
    { label: "Stories", value: listing.stories },
    { label: "Property Type", value: [listing.property_type, listing.property_sub_type].filter(Boolean).join(" — ") || null },
    { label: "Parking Spaces", value: listing.parking_total },
    { label: "Garage", value: listing.garage_spaces },
  ].filter((d) => d.value != null);

  // ── Tax & Financial info ──────────────────────────────────
  // Use public records tax (authoritative) if available, fall back to MLS
  const annualTax = pr?.tax_annual || ((listing.tax_annual_amount ?? 0) > 0 ? listing.tax_annual_amount : null) || null;
  const taxSource = pr?.tax_annual ? "NJ Public Records" : listing.tax_year ? `${listing.tax_year}` : null;

  const financials = [
    annualTax && {
      label: "Annual Property Taxes",
      value: `${formatPrice(annualTax)}${taxSource ? ` (${taxSource})` : ""}`,
    },
    pr?.assessed_value && {
      label: "Tax Assessment",
      value: formatPrice(pr.assessed_value),
    },
    pr?.land_assessment && {
      label: "Land Assessment",
      value: formatPrice(pr.land_assessment),
    },
    pr?.last_sale_price && pr.last_sale_price > 0 && {
      label: "Last Sale Price",
      value: formatPrice(pr.last_sale_price),
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

  // Filter out "None" values — they add no information
  const feat = (label: string, val: string | undefined | null): string | false =>
    val && val.toLowerCase() !== "none" ? `${label}: ${val}` : false;

  const interiorItems = [feat("Heating", feats.heating), feat("Cooling", feats.cooling), feat("Flooring", feats.flooring),
    feat("Appliances", feats.appliances), feat("Interior", feats.interior), feat("Basement", feats.basement),
    feat("Fireplace", feats.fireplace)].filter(Boolean) as string[];
  if (interiorItems.length > 0) featureGroups.push({ title: "Interior", items: interiorItems });
  const exteriorItems = [feat("Exterior", feats.exterior), feat("Parking", feats.garage_parking), feat("Pool", feats.pool),
    feat("Lot", feats.lot_description), feat("Waterfront", feats.waterfront), feat("Views", feats.views),
    feat("Flood Plain", feats.flood_plain)].filter(Boolean) as string[];
  if (exteriorItems.length > 0) featureGroups.push({ title: "Exterior & Lot", items: exteriorItems });
  const utilityItems = [feat("Water", feats.water), feat("Sewer", feats.sewer)].filter(Boolean) as string[];
  if (utilityItems.length > 0) featureGroups.push({ title: "Utilities", items: utilityItems });
  const otherItems = [feat("Ownership", feats.ownership), feat("Association", feats.association),
    feat("Lifestyle", feats.lifestyle), feat("Other", feats.misc)].filter(Boolean) as string[];
  if (otherItems.length > 0) featureGroups.push({ title: "Other Details", items: otherItems });

  const jsonLd = { "@context": "https://schema.org", "@type": "RealEstateListing", name: address,
    url: `https://gardenstate.ai/property/${slug}`, description: listing.public_remarks, image: listing.primary_photo_url,
    offers: { "@type": "Offer", price: listing.list_price, priceCurrency: "USD" },
    address: { "@type": "PostalAddress", streetAddress: [listing.street_number, listing.street_name].filter(Boolean).join(" "),
      addressLocality: listing.city, addressRegion: listing.state_or_province, postalCode: listing.postal_code } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <PhotoGallery mlsNumber={listing.mls_number} photoCount={realPhotoCount || listing.photo_count} address={address}
          isSold={isSold} />

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
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`rounded-full px-4 py-1 text-sm font-bold text-white ${isSold ? "bg-red-600" : "bg-green-600"}`}>
                  {listing.mls_status}
                </span>
                {daysOnMarket !== null && !isSold && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {daysOnMarket === 0 ? "New today" : `${daysOnMarket}d on market`}
                  </span>
                )}
                {priceReduced && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    Price Reduced {priceDropPct}%
                  </span>
                )}
              </div>
            </div>

            {/* AI Value Estimate + $/sqft + Est. Rent (like Zillow Zestimate) */}
            {aiEstimate && (
              <div className="mt-4 rounded-xl bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 p-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs font-medium text-indigo-600">AI Value Estimate</p>
                    <p className="text-2xl font-bold text-navy">{formatPrice(aiEstimate.estimatedValue)}</p>
                    <p className="text-[10px] text-gray-400">{formatPrice(aiEstimate.lowRange)} — {formatPrice(aiEstimate.highRange)}</p>
                  </div>
                  {aiEstimate.pricePerSqft > 0 && (
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500">$/Sqft</p>
                      <p className="text-lg font-bold text-navy">${aiEstimate.pricePerSqft}</p>
                    </div>
                  )}
                  {estMonthlyRent && (
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500">Est. Rent</p>
                      <p className="text-lg font-bold text-navy">{formatPrice(estMonthlyRent)}/mo</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500">Confidence</p>
                    <p className={`text-sm font-bold ${aiEstimate.confidence === "High" ? "text-green-600" : aiEstimate.confidence === "Medium" ? "text-yellow-600" : "text-gray-500"}`}>{aiEstimate.confidence}</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-gray-400">Powered by Garden State AI — based on comparable sales, tax records, and equalization ratios.</p>
              </div>
            )}

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
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 break-words">
                            <span className="mt-0.5 text-gold shrink-0">&#10003;</span>
                            <span className="break-all sm:break-words">{item}</span>
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

            {/* Mortgage Calculator */}
            {listing.list_price && !isSold && (
              <div className="mt-8">
                <MortgageCalculator
                  listPrice={listing.list_price}
                  annualTaxes={annualTax ?? null}
                  hoaMonthly={listing.association_fee ? Number(listing.association_fee) : null}
                />
              </div>
            )}
          </div>

          {/* Sidebar: Vale chat */}
          <div className="space-y-6">
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
