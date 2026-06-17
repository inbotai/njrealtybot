"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getPhotoUrl } from "@/lib/api";

export default function PhotoGallery({ mlsNumber, photoCount, address, isSold }: {
  mlsNumber: string; photoCount: number; address: string; isSold?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // NJMLS rule: sold listings may only show the first photo
  const total = isSold ? Math.min(photoCount, 1) : Math.min(photoCount, 25);
  // Track which photo indices failed to load
  const [failedPhotos, setFailedPhotos] = useState<Set<number>>(new Set());
  // Retry with ?nocache=1 if all photos fail but photoCount > 0
  const [retried, setRetried] = useState(false);
  const [useNocache, setUseNocache] = useState(false);

  const handleError = useCallback((index: number) => {
    setFailedPhotos(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Working photos = all indices minus failed ones
  const workingIndices = Array.from({ length: total }, (_, i) => i).filter(i => !failedPhotos.has(i));

  // Auto-retry once with nocache if all photos failed but MLS says they exist
  useEffect(() => {
    if (!retried && photoCount > 0 && workingIndices.length === 0 && failedPhotos.size >= total) {
      setRetried(true);
      setUseNocache(true);
      setFailedPhotos(new Set());
    }
  }, [retried, photoCount, workingIndices.length, failedPhotos.size, total]);

  const photoUrl = (index: number) =>
    useNocache ? `${getPhotoUrl(mlsNumber, index)}?nocache=1` : getPhotoUrl(mlsNumber, index);

  if (photoCount === 0 || (workingIndices.length === 0 && failedPhotos.size > 0)) {
    return (
      <div className="relative aspect-[16/9] max-h-[500px] overflow-hidden rounded-xl bg-gray-200">
        <div className="flex h-full items-center justify-center text-gray-400 text-lg">No Photo Available</div>
      </div>
    );
  }

  // If active photo failed, jump to next working one
  const displayIndex = failedPhotos.has(activeIndex)
    ? (workingIndices[0] ?? 0)
    : activeIndex;

  function goNext() {
    const currentPos = workingIndices.indexOf(displayIndex);
    const nextPos = (currentPos + 1) % workingIndices.length;
    setActiveIndex(workingIndices[nextPos]);
  }
  function goPrev() {
    const currentPos = workingIndices.indexOf(displayIndex);
    const prevPos = (currentPos - 1 + workingIndices.length) % workingIndices.length;
    setActiveIndex(workingIndices[prevPos]);
  }

  return (
    <div>
      {/* Main photo */}
      <div className="relative aspect-[16/9] max-h-[500px] overflow-hidden rounded-xl bg-gray-200">
        <img
          src={photoUrl(displayIndex)}
          alt={`${address} — Photo ${displayIndex + 1}`}
          className="h-full w-full object-cover"
          onError={() => handleError(displayIndex)}
        />
        {/* Navigation arrows */}
        {workingIndices.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white text-xl hover:bg-black/60"
              aria-label="Previous photo"
            >&lsaquo;</button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white text-xl hover:bg-black/60"
              aria-label="Next photo"
            >&rsaquo;</button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {workingIndices.indexOf(displayIndex) + 1} / {workingIndices.length}
            </span>
          </>
        )}
      </div>
      {/* Thumbnails — only show working photos */}
      {workingIndices.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {workingIndices.map((i) => (
            <img
              key={i}
              src={photoUrl(i)}
              alt={`Photo ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              onError={() => handleError(i)}
              className={`h-20 w-28 flex-shrink-0 rounded-lg object-cover cursor-pointer transition ${
                i === displayIndex ? "ring-2 ring-indigo-500 opacity-100" : "opacity-70 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
