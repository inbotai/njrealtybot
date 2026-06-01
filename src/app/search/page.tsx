import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPageClient from "@/components/SearchPageClient";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Search Homes for Sale in New Jersey",
  description:
    "Browse thousands of homes for sale in New Jersey. Filter by city, price, beds, baths, and property type.",
};

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
