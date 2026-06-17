"use client";

import { useState } from "react";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

const benefits = [
  { icon: "🏠", title: "Instant Sale Alerts", desc: "Get a WhatsApp message the moment a home near you sells — with the sale price." },
  { icon: "📊", title: "Your Home's Value", desc: "Each alert includes an AI estimate of YOUR home's current value based on the latest data." },
  { icon: "📈", title: "Market Trends", desc: "See if prices in your neighborhood are going up or down — before everyone else." },
  { icon: "🔒", title: "Free & Private", desc: "100% free. No spam. Unsubscribe anytime. Your info stays private." },
];

export default function AlertsPageClient() {
  const [form, setForm] = useState({ address: "", city: "", phone: "", email: "", full_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.city.trim() || (!form.phone.trim() && !form.email.trim())) {
      setError("Please enter your city and phone number or email.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${IDX_API}/api/idx/alerts/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-navy">You&apos;re In!</h2>
          <p className="mt-3 text-gray-600">
            You&apos;ll receive a WhatsApp message whenever a home sells near{" "}
            <strong>{form.address || form.city}</strong>. Each alert includes an
            AI estimate of your home&apos;s current value.
          </p>
          <p className="mt-4 text-sm text-gray-400">
            Reply to any alert to chat with Vale, our AI real estate assistant.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy py-20 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-indigo-900" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Know When Homes <span className="text-gold">Sell Near You</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Free WhatsApp alerts with sale prices + your home&apos;s estimated value. Updated in real time from NJMLS &amp; GSMLS.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="text-center p-4">
              <div className="text-3xl mb-2">{b.icon}</div>
              <h3 className="font-semibold text-navy text-sm">{b.title}</h3>
              <p className="mt-1 text-xs text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-lg px-4">
          <h2 className="text-2xl font-bold text-navy text-center mb-8">
            Sign Up for Free Alerts
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Smith"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Address <span className="text-gray-400">(optional)</span></label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Rutherford"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 201 555 1234"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-[10px] text-gray-500 leading-relaxed">
                I consent to receive SMS/WhatsApp messages from Garden State AI
                about property alerts and real estate services.
                Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out.
                Your mobile info will not be shared with third parties.{" "}
                <a href="/privacy" target="_blank" className="underline hover:text-gray-700">Privacy Policy</a>
                {" & "}
                <a href="/terms" target="_blank" className="underline hover:text-gray-700">Terms</a>.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {submitting ? "Subscribing..." : "Get Free Alerts"}
            </button>
          </form>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy mb-10">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">1</div>
              <h3 className="mt-3 font-semibold text-navy">Sign Up</h3>
              <p className="mt-2 text-sm text-gray-600">Enter your city and phone number. Takes 10 seconds.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">2</div>
              <h3 className="mt-3 font-semibold text-navy">We Monitor</h3>
              <p className="mt-2 text-sm text-gray-600">Our AI scans NJMLS &amp; GSMLS every 15 minutes for new sales in your area.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">3</div>
              <h3 className="mt-3 font-semibold text-navy">You Get Alerts</h3>
              <p className="mt-2 text-sm text-gray-600">WhatsApp message with the sale price + your home&apos;s estimated value. Reply to chat with Vale.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
