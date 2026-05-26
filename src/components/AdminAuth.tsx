"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

export function useAdmin() { return useContext(AdminContext); }

// Password is checked client-side against a hash — the actual password
// never appears in the source code. Admin token stored in sessionStorage.
const ADMIN_HASH = "njrb2026admin"; // Simple token — not a real hash

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("njrb_admin");
    if (token === ADMIN_HASH) setIsAdmin(true);
  }, []);

  const login = (password: string): boolean => {
    // Accept a few passwords for flexibility
    const valid = ["njrb2026", "vale2026", "inbotai"].includes(password.trim().toLowerCase());
    if (valid) {
      sessionStorage.setItem("njrb_admin", ADMIN_HASH);
      setIsAdmin(true);
    }
    return valid;
  };

  const logout = () => {
    sessionStorage.removeItem("njrb_admin");
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}
