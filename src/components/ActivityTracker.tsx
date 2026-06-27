"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const API_URL =
  "https://inbot-idx-api-production.up.railway.app/api/idx/activity";
const FLUSH_INTERVAL = 5000;
const STORAGE_SESSION = "gsai_session_id";
const STORAGE_PHONE = "gsai_phone";

declare global {
  interface Window {
    gsaiTrack?: (event: string, data?: Record<string, any>) => void;
    gsaiSetPhone?: (phone: string) => void;
  }
}

interface ActivityEvent {
  session_id: string;
  phone: string | null;
  event: string;
  data: Record<string, any>;
  timestamp: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_SESSION);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_SESSION, id);
  }
  return id;
}

function getPhone(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_PHONE);
}

function flushEvents(queue: ActivityEvent[]) {
  if (queue.length === 0) return;
  const payload = JSON.stringify(queue);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(API_URL, new Blob([payload], { type: "application/json" }));
  } else {
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

export default function ActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queueRef = useRef<ActivityEvent[]>([]);
  const sessionRef = useRef("");

  const enqueue = useCallback((event: string, data: Record<string, any> = {}) => {
    queueRef.current.push({
      session_id: sessionRef.current,
      phone: getPhone(),
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Initialize session + global functions
  useEffect(() => {
    sessionRef.current = getSessionId();

    window.gsaiTrack = (event: string, data?: Record<string, any>) => {
      enqueue(event, data || {});
    };

    window.gsaiSetPhone = (phone: string) => {
      localStorage.setItem(STORAGE_PHONE, phone);
    };

    // Flush timer
    const timer = setInterval(() => {
      const batch = queueRef.current.splice(0);
      flushEvents(batch);
    }, FLUSH_INTERVAL);

    // Flush on unload
    const handleUnload = () => {
      const batch = queueRef.current.splice(0);
      flushEvents(batch);
    };
    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleUnload();
    });

    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", handleUnload);
      window.gsaiTrack = undefined;
      window.gsaiSetPhone = undefined;
      handleUnload();
    };
  }, [enqueue]);

  // Route-based tracking
  useEffect(() => {
    if (!pathname || !sessionRef.current) return;

    // Property view: /property/[slug]
    const propertyMatch = pathname.match(/^\/property\/(.+)/);
    if (propertyMatch) {
      enqueue("property_view", { path: pathname, listing_id: propertyMatch[1] });
      return;
    }

    // Article read: /news/[slug]
    const articleMatch = pathname.match(/^\/news\/(.+)/);
    if (articleMatch) {
      enqueue("article_read", { path: pathname, slug: articleMatch[1] });
      return;
    }

    // Search with filters
    if (pathname === "/search") {
      const data: Record<string, any> = { path: pathname };
      const city = searchParams?.get("city");
      const beds = searchParams?.get("beds");
      const minPrice = searchParams?.get("minPrice");
      const maxPrice = searchParams?.get("maxPrice");
      if (city) data.city = city;
      if (beds) data.beds = beds;
      if (minPrice) data.minPrice = minPrice;
      if (maxPrice) data.maxPrice = maxPrice;
      enqueue("search", data);
      return;
    }

    // Generic page view
    enqueue("page_view", { path: pathname });
  }, [pathname, searchParams, enqueue]);

  return null;
}
