import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPageClient from "@/components/SearchPageClient";
import RequireAuth from "@/components/RequireAuth";
import { fetchActiveListingCount, formatActiveCount } from "@/lib/listing-inventory";

export async function generateMetadata(): Promise<Metadata> {
  const active = await fetchActiveListingCount();
  const countLabel = `${formatActiveCount(active)} Active MLS Listings`;
  const title = `Search NJ Homes for Sale — ${countLabel} | Garden State AI`;
  const description =
    "Search active MLS listings in New Jersey. Filter by city, price, beds, baths, property type, square footage, and more. Updated daily from GSMLS and NJMLS.";
  return {
    title: { absolute: title },
    description,
    keywords: [
      "search NJ homes for sale",
      "New Jersey MLS search",
      "NJ homes for sale by city",
      "GSMLS listings NJ",
      "NJMLS property search",
    ],
    alternates: {
      canonical: "https://gardenstate.ai/search",
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: "https://gardenstate.ai/search",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function SearchFallback() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // Key forces React to remount SearchPageClient when URL params change
  // (e.g. hero navigates from Morristown to Wayne while already on /search)
  const key = JSON.stringify(params);

  return (
    <RequireAuth>
      <Suspense fallback={<SearchFallback />}>
        <SearchPageClient key={key} />
      </Suspense>
    </RequireAuth>
  );
}
