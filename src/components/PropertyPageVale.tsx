"use client";

import { useEffect } from "react";
import { useVale } from "./ValeProvider";

/** Activates Vale with this property's context — starts new session */
export default function PropertyPageVale({ listingId }: { listingId: string }) {
  const { setCurrentListing, openPanel, closePanel, startNewSession } = useVale();

  useEffect(() => {
    setCurrentListing(listingId);
    openPanel();
    startNewSession(listingId);
    return () => { setCurrentListing(null); closePanel(); };
  }, [listingId, setCurrentListing, openPanel, closePanel, startNewSession]);

  return null;
}
