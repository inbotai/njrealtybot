"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AdminContextType {
  isAdmin: boolean;
  authLoaded: boolean;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => boolean;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  authLoaded: false,
  login: async () => ({ ok: false }),
  logout: async () => {},
  changePassword: () => false,
});

export function useAdmin() { return useContext(AdminContext); }

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session")
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((d) => { if (!cancelled) setIsAdmin(!!d.isAdmin); })
      .catch(() => { if (!cancelled) setIsAdmin(false); })
      .finally(() => { if (!cancelled) setAuthLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const login = async (password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAdmin(true);
        return { ok: true };
      }
      setIsAdmin(false);
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error || "Invalid password" };
    } catch {
      setIsAdmin(false);
      return { ok: false, error: "Could not reach the login service." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    } catch { /* still clear local state */ }
    setIsAdmin(false);
  };

  // Passwords live in server env (ADMIN_PASSWORDS). The browser must not store them.
  const changePassword = (_newPassword: string): boolean => false;

  return (
    <AdminContext.Provider value={{ isAdmin, authLoaded, login, logout, changePassword }}>
      {children}
    </AdminContext.Provider>
  );
}
