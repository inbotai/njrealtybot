"use client";

import type { Ref } from "react";
import Link from "next/link";

export default function ListingUnavailableNotice({
  onRetry,
  heading = "This page is temporarily unavailable",
  detail = "We couldn't load it right now. Please try again in a few minutes.",
  countdownRef = null,
}: {
  onRetry?: () => void;
  heading?: string;
  detail?: string;
  countdownRef?: Ref<HTMLParagraphElement> | null;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold">Garden State AI</p>
      <h1 className="mt-3 text-3xl font-bold text-navy">{heading}</h1>
      <p className="mt-3 text-gray-600">{detail}</p>
      {countdownRef ? (
        <p ref={countdownRef} hidden className="mt-3 text-base font-semibold text-navy" data-listing-retry-countdown="">
          <span className="sr-only">Trying again automatically.</span>
          <span aria-hidden="true" data-listing-retry-remaining="" />
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        ) : null}
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
