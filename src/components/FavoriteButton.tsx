"use client";

import { useFavorites } from "@/lib/favorites";

export default function FavoriteButton({ listingId, size = "md" }: { listingId: string; size?: "sm" | "md" }) {
  const { toggle, isFav } = useFavorites();
  const active = isFav(listingId);
  const px = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(listingId); }}
      className={`${px} flex items-center justify-center rounded-full transition ${
        active ? "bg-red-50 text-red-500" : "bg-white/80 text-gray-400 hover:text-red-400"
      } shadow-sm backdrop-blur-sm`}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
