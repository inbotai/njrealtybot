"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Listing } from "@/lib/api";

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
}

const ValeContext = createContext<ValeContextType | null>(null);

export function useVale() {
  const ctx = useContext(ValeContext);
  if (!ctx) throw new Error("useVale must be inside ValeProvider");
  return ctx;
}

export default function ValeProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ValeMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [listings, setListingsState] = useState<Listing[]>([]);
  const [currentListingId, setCurrentListingId] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);

  // Start or resume session
  const ensureSession = useCallback(async (listingId?: string | null): Promise<string> => {
    if (sessionRef.current) return sessionRef.current;
    const vid = localStorage.getItem("vale_vid") || "";
    const body: any = {};
    if (vid) body.visitorId = vid;
    if (listingId) body.listingId = listingId;
    const r = await fetch(`${IDX_API}/api/idx/chat/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
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
      const r = await fetch(`${IDX_API}/api/idx/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, message: text }),
      });
      const d = await r.json();
      const reply = d.reply || d.error || "Something went wrong.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);

      // Extract listing IDs from response and fetch them
      const ids = [...reply.matchAll(/\[ID:([a-f0-9-]{36})\]/gi)].map((m: any) => m[1]);
      if (ids.length > 0) {
        const fetched = await Promise.all(
          ids.slice(0, 12).map((id: string) =>
            fetch(`${IDX_API}/api/idx/listings/${id}`)
              .then(r => r.json())
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

  return (
    <ValeContext.Provider value={{
      messages, sessionId, loading, panelOpen, listings, currentListingId,
      send, togglePanel, openPanel, closePanel, setCurrentListing, setListings,
    }}>
      {children}
    </ValeContext.Provider>
  );
}
