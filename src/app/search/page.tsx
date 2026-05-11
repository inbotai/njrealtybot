import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPageClient from "@/components/SearchPageClient";

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

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}
