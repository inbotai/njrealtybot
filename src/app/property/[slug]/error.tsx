"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ListingUnavailableNotice from "@/components/ListingUnavailableNotice";
import { listingAutoRetryDelaySeconds, LISTING_AUTO_RETRY_MAX } from "@/lib/listing-retry";

const RETRY_WINDOW_MS = 10 * 60 * 1000;

type RetryRecord = { attempts: number; at: number };

const memoryAttempts = new Map<string, RetryRecord>();

function storageKey(pathname: string): string {
  return `gsai-property-retry:${pathname}`;
}

function readAttempts(pathname: string): number {
  let record: RetryRecord | null = null;
  try {
    const raw = sessionStorage.getItem(storageKey(pathname));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RetryRecord>;
      if (typeof parsed.attempts === "number" && typeof parsed.at === "number") {
        record = { attempts: parsed.attempts, at: parsed.at };
      }
    }
  } catch {
    record = memoryAttempts.get(pathname) ?? null;
  }
  if (!record || Date.now() - record.at > RETRY_WINDOW_MS) return 0;
  return record.attempts;
}

function writeAttempts(pathname: string, attempts: number): void {
  const record = { attempts, at: Date.now() };
  memoryAttempts.set(pathname, record);
  try {
    sessionStorage.setItem(storageKey(pathname), JSON.stringify(record));
  } catch {
    /* private mode */
  }
}

export default function PropertyError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname() || "/property";
  const retryRef = useRef(unstable_retry);
  const fired = useRef(false);
  const timerRef = useRef(0);
  const countdownRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    retryRef.current = unstable_retry;
  }, [unstable_retry]);

  useEffect(() => {
    const node = countdownRef.current;
    const remaining = node?.querySelector("[data-listing-retry-remaining]");
    if (!node || !remaining) return;
    fired.current = false;
    const attempts = readAttempts(pathname);
    const delay = listingAutoRetryDelaySeconds(attempts);
    if (delay == null) {
      node.hidden = true;
      return;
    }
    node.hidden = false;
    const started = Date.now();
    const paint = () => {
      const left = Math.max(0, delay - Math.floor((Date.now() - started) / 1000));
      remaining.textContent = `Trying again in ${left}s · automatic try ${attempts + 1} of ${LISTING_AUTO_RETRY_MAX}`;
    };
    paint();
    const tick = window.setInterval(paint, 250);
    timerRef.current = window.setTimeout(() => {
      if (fired.current) return;
      fired.current = true;
      writeAttempts(pathname, attempts + 1);
      retryRef.current();
    }, delay * 1000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(timerRef.current);
    };
  }, [pathname]);

  const retryNow = () => {
    if (fired.current) return;
    fired.current = true;
    window.clearTimeout(timerRef.current);
    unstable_retry();
  };

  return (
    <>
      <title>Listing temporarily unavailable</title>
      <meta name="robots" content="noindex, nofollow" />
      <ListingUnavailableNotice
        onRetry={retryNow}
        heading="This listing is temporarily unavailable"
        detail="We couldn't load this property right now. Please try again in a few minutes."
        countdownRef={countdownRef}
      />
    </>
  );
}
