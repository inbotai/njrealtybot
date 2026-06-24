"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { Listing } from "@/lib/api";
import { useAdmin } from "./AdminAuth";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

export interface ValeMessage {
  role: "user" | "assistant";
  text: string;
}

interface ValeState {
  messages: ValeMessage[];
  sessionId: string | null;
  loading: boolean;
  panelOpen: boolean;
  listings: Listing[];
  currentListingId: string | null;
}

interface ValeContextType extends ValeState {
  send: (text: string) => Promise<void>;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setCurrentListing: (id: string | null) => void;
  setListings: (listings: Listing[]) => void;
  startNewSession: (listingId?: string) => Promise<void>;
}

const ValeContext = createContext<ValeContextType | null>(null);

export function useVale() {
  const ctx = useContext(ValeContext);
  if (!ctx) throw new Error("useVale must be inside ValeProvider");
  return ctx;
}

const ADMIN_API_TOKEN = "njrb-admin-2026-xk9";

export default function ValeProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdmin();
  const [messages, setMessages] = useState<ValeMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [listings, setListingsState] = useState<Listing[]>([]);
  const [currentListingId, setCurrentListingId] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);

  const lastListingRef = useRef<string | null>(null);

  // Start or resume session — starts new if listing context changed
  const ensureSession = useCallback(async (listingId?: string | null): Promise<string> => {
    // If we have a session but the listing changed, start a new one
    if (sessionRef.current && listingId && listingId !== lastListingRef.current) {
      sessionRef.current = null;
    }
    if (sessionRef.current) return sessionRef.current;

    lastListingRef.current = listingId || null;
    const vid = localStorage.getItem("vale_vid") || "";
    const body: any = {};
    if (vid) body.visitorId = vid;
    if (listingId) body.listingId = listingId;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (isAdmin) headers["X-Admin-Token"] = ADMIN_API_TOKEN;
    const r = await fetch(`${IDX_API}/api/idx/chat/start`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`chat/start ${r.status}`);
    const d = await r.json();
    if (d.visitorId) localStorage.setItem("vale_vid", d.visitorId);
    sessionRef.current = d.sessionId;
    setSessionId(d.sessionId);
    setMessages([{ role: "assistant", text: d.greeting }]);
    return d.sessionId;
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setPanelOpen(true);
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const sid = await ensureSession(currentListingId);
      const msgHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (isAdmin) msgHeaders["X-Admin-Token"] = ADMIN_API_TOKEN;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      const r = await fetch(`${IDX_API}/api/idx/chat/message`, {
        method: "POST",
        headers: msgHeaders,
        body: JSON.stringify({ sessionId: sid, message: text }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!r.ok) throw new Error(`chat/message ${r.status}`);
      const d = await r.json();
      const reply = d.reply || d.error || "Something went wrong.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);

      // Extract listing IDs from response and fetch them
      const ids = [...reply.matchAll(/\[ID:([a-f0-9-]{36})\]/gi)].map((m: any) => m[1]);
      if (ids.length > 0) {
        const fetched = await Promise.all(
          ids.slice(0, 12).map((id: string) =>
            fetch(`${IDX_API}/api/idx/listings/${id}`, { signal: AbortSignal.timeout(8000) })
              .then(r => { if (!r.ok) return null; return r.json(); })
              .then(d => d.listing || null)
              .catch(() => null)
          )
        );
        setListingsState(fetched.filter(Boolean));
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Try again." }]);
    }
    setLoading(false);
  }, [loading, ensureSession, currentListingId]);

  const togglePanel = useCallback(() => setPanelOpen(p => !p), []);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const setCurrentListing = useCallback((id: string | null) => setCurrentListingId(id), []);
  const setListings = useCallback((l: Listing[]) => setListingsState(l), []);

  // Force a new session with a specific listing context
  const startNewSession = useCallback(async (listingId?: string) => {
    sessionRef.current = null;
    lastListingRef.current = null;
    setListingsState([]);
    await ensureSession(listingId || null);
  }, [ensureSession]);

  return (
    <ValeContext.Provider value={{
      messages, sessionId, loading, panelOpen, listings, currentListingId,
      send, togglePanel, openPanel, closePanel, setCurrentListing, setListings, startNewSession,
    }}>
      {children}
    </ValeContext.Provider>
  );
}
