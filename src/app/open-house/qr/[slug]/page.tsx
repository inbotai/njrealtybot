import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchListing, fetchListings } from "@/lib/api";
import { formatPrice, formatAddress, parseSlug } from "@/lib/utils";
import PrintButton from "@/components/PrintButton";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Resolve a listing from the slug — same logic as the landing page.
 */
async function resolveListing(slug: string) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  if (uuidPattern.test(slug)) {
    const id = parseSlug(slug);
    try {
      return await fetchListing(id);
    } catch {
      /* fall through */
    }
  }

  try {
    const result = await fetchListings({ mls_number: slug, pageSize: "1" });
    const listings = result.listings || result.data || [];
    if (listings.length > 0) {
      return await fetchListing(listings[0].id);
    }
  } catch {
    /* fall through */
  }

  return null;
}

function getQrImageUrl(url: string, size = 400): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=16`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Open House QR Code: ${slug}`,
    robots: { index: false, follow: false },
  };
}

export default async function OpenHouseQRPage({ params }: Props) {
  const { slug } = await params;
  const data = await resolveListing(slug);

  if (!data) {
    notFound();
  }

  const { listing } = data;
  const address = formatAddress(listing);
  const landingUrl = `https://gardenstate.ai/open-house/${listing.mls_number}`;
  const qrUrl = getQrImageUrl(landingUrl, 400);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Printable QR flyer */}
      <div className="w-full max-w-md text-center print:max-w-none">
        {/* Logo */}
        <img
          src="/bhg-logo-green.png"
          alt="Better Homes and Gardens Real Estate"
          className="mx-auto h-14 w-auto mb-6"
        />

        {/* Property info */}
        <h1 className="text-2xl font-bold text-navy">{address}</h1>
        {listing.list_price && (
          <p className="mt-1 text-xl font-semibold text-gold">
            {formatPrice(listing.list_price)}
          </p>
        )}

        <div className="mt-1 flex justify-center gap-4 text-sm text-gray-600">
          {listing.bedrooms_total != null && <span>{listing.bedrooms_total} Beds</span>}
          {listing.bathrooms_total != null && <span>{listing.bathrooms_total} Baths</span>}
          {listing.living_area != null && <span>{listing.living_area.toLocaleString()} Sqft</span>}
        </div>

        {/* QR Code */}
        <div className="mt-8 mb-4">
          <img
            src={qrUrl}
            alt={`QR code for ${address} open house`}
            width={300}
            height={300}
            className="mx-auto"
          />
        </div>

        {/* CTA */}
        <p className="text-lg font-bold text-navy">Scan to Sign In</p>
        <p className="mt-1 text-sm text-gray-500">
          Get listing details, market reports &amp; similar home alerts
        </p>

        {/* URL fallback */}
        <p className="mt-4 text-xs text-gray-400 break-all">{landingUrl}</p>

        {/* MLS number */}
        <p className="mt-2 text-xs text-gray-400">MLS# {listing.mls_number}</p>

        {/* Print button — hidden in print */}
        <div className="mt-8 print:hidden flex gap-3 justify-center">
          <PrintButton />
          <a
            href={landingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
          >
            Preview Landing Page
          </a>
        </div>

        {/* Powered by */}
        <p className="mt-6 text-xs text-gray-400 print:hidden">
          Powered by GardenState.ai
        </p>
      </div>
    </div>
  );
}
