"use client";

import { useState } from "react";
import { useAdmin } from "@/components/AdminAuth";

/**
 * Shows a login form when not authenticated, renders children when logged in.
 * Used on /admin page (and any route that always requires auth).
 */
export default function AdminLoginGate({ children }: { children: React.ReactNode }) {
  const { isAdmin, login, changePassword } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showChangePw, setShowChangePw] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  if (isAdmin) return <>{children}</>;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!login(password)) {
      setError("Invalid password");
      setTimeout(() => setError(""), 3000);
    }
  }

  function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    if (!login(password)) { setPwMsg("Current password is incorrect"); return; }
    if (newPw.length < 4) { setPwMsg("Minimum 4 characters"); return; }
    if (newPw !== confirmPw) { setPwMsg("Passwords don't match"); return; }
    if (changePassword(newPw)) {
      setPwMsg("Password updated!");
      setNewPw(""); setConfirmPw(""); setPassword("");
      setTimeout(() => { setShowChangePw(false); setPwMsg(""); }, 1500);
    }
  }

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-white py-12">
      <div className="relative mx-auto max-w-md px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy">
          <span className="text-gold">Garden</span>
          <span className="text-navy"> State </span>
          <span className="text-indigo-600">AI</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500">Agent Dashboard</p>

        <form onSubmit={handleLogin} className="mx-auto mt-10 max-w-sm">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm font-medium text-gray-600 mb-4">Agent Login</p>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter password"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={!password.trim()}
              className="mt-4 w-full rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-yellow-400 disabled:opacity-40"
            >
              Login
            </button>
            <button type="button" onClick={() => setShowChangePw(true)}
              className="mt-3 text-xs text-gray-500 hover:text-gold transition">
              Change Password
            </button>
          </div>
        </form>

        {showChangePw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowChangePw(false)}>
            <form onSubmit={handleChangePw} onClick={e => e.stopPropagation()}
              className="w-80 space-y-3 rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-navy">Change Password</h3>
              <p className="text-xs text-gray-400">Enter current password first to verify</p>
              <input type="password" placeholder="Current password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500" />
              <input type="password" placeholder="New password" value={newPw}
                onChange={e => { setNewPw(e.target.value); setPwMsg(""); }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500" />
              <input type="password" placeholder="Confirm new password" value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setPwMsg(""); }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500" />
              {pwMsg && <p className={`text-xs ${pwMsg.includes("updated") ? "text-green-600" : "text-red-500"}`}>{pwMsg}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={!password || !newPw}
                  className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm text-white font-medium hover:bg-indigo-700 disabled:opacity-40">Save</button>
                <button type="button" onClick={() => setShowChangePw(false)}
                  className="flex-1 rounded-lg border py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
