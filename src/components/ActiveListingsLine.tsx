"use client";

import { useEffect, useState } from "react";
import { activeListingsSentence, fetchActiveListingCount } from "@/lib/listing-inventory";

export default function ActiveListingsLine({ className }: { className?: string }) {
  const [text, setText] = useState(() => activeListingsSentence(null));

  useEffect(() => {
    let cancelled = false;
    fetchActiveListingCount().then((n) => {
      if (!cancelled) setText(activeListingsSentence(n));
    });
    return () => { cancelled = true; };
  }, []);

  return <p className={className}>{text}</p>;
}
