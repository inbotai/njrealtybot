"use client";

import { useVale } from "./ValeProvider";
import ListingCard from "./ListingCard";

/** Renders Vale's found listings as full cards in the main content area */
export default function ValeListingsGrid() {
  const { listings } = useVale();

  if (listings.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-bold text-navy">Vale found {listings.length} properties</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map(l => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}
