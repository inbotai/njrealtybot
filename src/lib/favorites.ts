"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "gsai_favorites";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/** Hook: manages favorite listing IDs in localStorage */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => { setFavorites(getFavorites()); }, []);

  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const wasAdded = !prev.includes(id);
      const next = wasAdded ? [...prev, id] : prev.filter(f => f !== id);
      saveFavorites(next);
      // Beacon to backend when saving (fire-and-forget)
      if (wasAdded) {
        fetch(`https://inbot-idx-api-production.up.railway.app/api/idx/listings/${id}/save-event`, {
          method: "POST", keepalive: true,
        }).catch(() => {});
      }
      return next;
    });
  }, []);

  const isFav = useCallback((id: string) => favorites.includes(id), [favorites]);
  const count = favorites.length;

  return { favorites, toggle, isFav, count };
}
