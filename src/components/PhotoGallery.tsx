"use client";

import { useState } from "react";
import { getPhotoUrl } from "@/lib/api";

export default function PhotoGallery({ mlsNumber, photoCount, address, isSold }: {
  mlsNumber: string; photoCount: number; address: string; isSold?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // NJMLS rule: sold listings may only show the first photo
  const total = isSold ? Math.min(photoCount, 1) : Math.min(photoCount, 25);

  if (photoCount === 0) {
    return (
      <div className="relative aspect-[16/9] max-h-[500px] overflow-hidden rounded-xl bg-gray-200">
        <div className="flex h-full items-center justify-center text-gray-400 text-lg">No Photo Available</div>
      </div>
    );
  }

  return (
    <div>
      {/* Main photo */}
      <div className="relative aspect-[16/9] max-h-[500px] overflow-hidden rounded-xl bg-gray-200">
        <img
          src={getPhotoUrl(mlsNumber, activeIndex)}
          alt={`${address} — Photo ${activeIndex + 1}`}
          className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).className = "hidden"; }}
        />
        {/* Navigation arrows */}
        {total > 1 && (
          <>
            <button
              onClick={() => setActiveIndex(i => (i - 1 + total) % total)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white text-xl hover:bg-black/60"
              aria-label="Previous photo"
            >&lsaquo;</button>
            <button
              onClick={() => setActiveIndex(i => (i + 1) % total)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white text-xl hover:bg-black/60"
              aria-label="Next photo"
            >&rsaquo;</button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {activeIndex + 1} / {total}
            </span>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: total }, (_, i) => (
            <img
              key={i}
              src={getPhotoUrl(mlsNumber, i)}
              alt={`Photo ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`h-20 w-28 flex-shrink-0 rounded-lg object-cover cursor-pointer transition ${
                i === activeIndex ? "ring-2 ring-indigo-500 opacity-100" : "opacity-70 hover:opacity-100"
              }`}
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
}
