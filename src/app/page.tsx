"use client";

import { useState } from "react";
import { useAdmin } from "@/components/AdminAuth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!login(password)) {
      setError("Invalid password");
      setTimeout(() => setError(""), 3000);
    } else {
      router.push("/search");
    }
  }

  if (isAdmin) {
    return (
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-navy py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-md px-4 text-center">
          <h1 className="text-3xl font-extrabold">
            Welcome back
          </h1>
          <p className="mt-3 text-gray-400">You are logged in as admin.</p>
          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => router.push("/search")} className="rounded-lg bg-gold px-6 py-3 font-semibold text-navy hover:bg-yellow-400 transition">
              Search Listings
            </button>
            <button onClick={() => router.push("/chat")} className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10 transition">
              Chat with Vale
            </button>
            <button onClick={logout} className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition">
              Logout
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-navy py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-md px-4 text-center">
        {/* Logo */}
        <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
          <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">NJ</span>
          <span className="text-white"> Realty </span>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite_0.5s]">Bot</span>
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          The Most Intelligent AI in NJ for Properties
        </p>

        {/* Login form */}
        <form onSubmit={handleLogin} className="mx-auto mt-10 max-w-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-medium text-gray-300 mb-4">Admin Login</p>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter password"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={!password.trim()}
              className="mt-4 w-full rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-yellow-400 disabled:opacity-40"
            >
              Login
            </button>
          </div>
        </form>

        {/* Lead capture */}
        <div className="mt-12">
          <p className="text-sm text-gray-400 mb-3">
            Looking to buy or sell in NJ? Talk to Vale, our AI assistant.
          </p>
          <a
            href="/chat"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Chat with Vale AI
          </a>
        </div>
      </div>
    </section>
  );
}
