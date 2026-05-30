"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (newPassword: string) => boolean;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
  changePassword: () => false,
});

export function useAdmin() { return useContext(AdminContext); }

const ADMIN_HASH = "njrb2026admin";
const DEFAULT_PASSWORDS = ["Vale2026!@1", "vale2026", "gardenstate2026"];

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("njrb_admin");
    if (token === ADMIN_HASH) setIsAdmin(true);
  }, []);

  const login = (password: string): boolean => {
    const trimmed = password.trim();
    // Check custom password first, then defaults
    let customPw: string | null = null;
    try { customPw = localStorage.getItem("gsai_password"); } catch {}
    const validPasswords = customPw ? [customPw, ...DEFAULT_PASSWORDS] : DEFAULT_PASSWORDS;
    const valid = validPasswords.includes(trimmed);
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

  const changePassword = (newPassword: string): boolean => {
    if (newPassword.length < 4) return false;
    try { localStorage.setItem("gsai_password", newPassword); } catch {}
    return true;
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, changePassword }}>
      {children}
    </AdminContext.Provider>
  );
}
