"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");
    try {
      await fetch("https://app.beehiiv.com/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publication_id: "679cc02e-46da-442f-a403-4a17e33d87ea",
          email: email.trim(),
        }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center my-8">
        <p className="text-lg font-bold text-emerald-800">You're in!</p>
        <p className="mt-1 text-sm text-emerald-600">Check your inbox for a welcome email from Garden State AI.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-navy to-indigo-900 p-6 my-8">
      <h3 className="text-lg font-bold text-white">NJ Home & Tax Insider</h3>
      <p className="mt-1 text-sm text-gray-300">
        Weekly: property tax alerts, market news, new listings, and what's being built near you. Free.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 flex-wrap">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-[200px] rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-400 outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy hover:bg-yellow-400 disabled:opacity-50 transition whitespace-nowrap"
        >
          {status === "loading" ? "..." : "Get free weekly updates"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Something went wrong. Try again.</p>
      )}
      <p className="mt-3 text-[10px] text-gray-500">No spam. Unsubscribe anytime. Your info is never sold.</p>
    </div>
  );
}
