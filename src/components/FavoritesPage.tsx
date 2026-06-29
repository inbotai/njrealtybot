"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { fetchListing } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import type { Listing } from "@/lib/api";

export default function FavoritesPage() {
  const { favorites, count } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) { setLoading(false); return; }
    Promise.all(
      favorites.slice(0, 50).map(id =>
        fetchListing(id).then(d => d.listing).catch(() => null)
      )
    ).then(results => {
      setListings(results.filter((l): l is Listing => l !== null));
      setLoading(false);
    });
  }, [favorites]);

  return (
    <>
      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy">
            My Saved Properties{" "}
            <span className="text-gold">({count})</span>
          </h1>
          <p className="mt-2 text-gray-500">Properties you&apos;ve saved while browsing</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-4xl">&#128155;</p>
            <p className="mt-4 text-lg font-medium text-gray-500">No saved properties yet</p>
            <p className="mt-1 text-sm text-gray-400">Click the heart icon on any listing to save it here</p>
            <a href="/search" className="mt-6 inline-block rounded-lg bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-900">
              Browse Properties
            </a>
          </div>
        )}
      </div>
    </>
  );
}
