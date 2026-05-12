"use client";

import { useEffect } from "react";
import { useVale } from "./ValeProvider";

/** Activates Vale's side panel with this property's context */
export default function PropertyPageVale({ listingId }: { listingId: string }) {
  const { setCurrentListing, openPanel } = useVale();

  useEffect(() => {
    setCurrentListing(listingId);
    openPanel();
    return () => setCurrentListing(null);
  }, [listingId, setCurrentListing, openPanel]);

  // No visible UI — Vale appears in the side panel
  return null;
}
