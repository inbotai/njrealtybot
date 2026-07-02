"use client";

import { useEffect, useState } from "react";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

/**
 * "Verified Home History" badge — shown on property pages when the
 * seller has a public MyHome Log (privacy_level = 'public').
 * Links to the shared history view.
 */
export default function VerifiedHomeBadge({ address, city }: { address: string; city: string }) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !city) return;
    const controller = new AbortController();

    fetch(
      `${IDX_API}/api/idx/myhome/public-badge?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}`,
      { signal: controller.signal }
    )
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.share_url) setShareUrl(data.share_url);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [address, city]);

  if (!shareUrl) return null;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Verified Home History
    </a>
  );
}
