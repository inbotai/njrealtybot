"use client";

import { useState } from "react";
import Link from "next/link";
import { submitLead } from "@/lib/api";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

const radiusOptions = [
  { value: "0.25", label: "0.25 mi" },
  { value: "0.5", label: "0.5 mi" },
  { value: "1", label: "1 mi" },
];

const whyCards = [
  { title: "Know Your Market", desc: "Track real prices, not estimates. See exactly what homes sell for in your neighborhood." },
  { title: "Time Your Sale", desc: "See when demand peaks in your area and list at the perfect moment." },
  { title: "Negotiate Better", desc: "Use recent comps in negotiations — whether buying or selling." },
];

export default function CompAlertsClient() {
  const [form, setForm] = useState({
    address: "", city: "", phone: "", name: "", radius: "0.5",
  });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim() || !form.phone.trim()) {
      setError("Please fill in your address, city, and phone number.");
      return;
    }
    if (!consent) {
      setError("Please accept the messaging consent to continue.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // Subscribe to comp alerts
      const res = await fetch(`${IDX_API}/api/idx/alerts/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          radius: form.radius,
          alert_type: "comp_alerts",
        }),
      });
      const data = await res.json();
      if (!data.ok && data.error) {
        setError(data.error);
        return;
      }
      // Also register as lead
      await submitLead({
        full_name: form.name || "Comp Alert Subscriber",
        phone: form.phone,
        message: `Comp alert signup: ${form.address}, ${form.city} — radius ${form.radius} mi`,
        lead_type: "info_request",
      }).catch(() => {});
      setSuccess(true);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center bg-green-50 border border-green-200 rounded-2xl p-8 shadow-lg">
          <div className="text-5xl mb-4">{"\u2705"}</div>
          <h2 className="text-2xl font-bold text-green-800">You&apos;re All Set{form.name ? `, ${form.name.split(" ")[0]}` : ""}!</h2>
          <p className="mt-3 text-green-700">
            To activate your comp alerts, just send us a quick message:
          </p>
          <div className="mt-5 space-y-3">
            <a href={`https://wa.me/12015281095?text=${encodeURIComponent(`I want comp alerts for ${form.address}, ${form.city} within ${form.radius} mi`)}`} target="_blank" rel="noopener noreferrer" className="block w-full rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700 transition text-center">
              Open WhatsApp
            </a>
            <p className="text-gray-500 text-sm">
              or text <strong>(201) 528-1095</strong> and say &ldquo;I want comp alerts for {form.city}&rdquo;
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            You&apos;ll get alerts whenever a home sells within{" "}
            <strong>{form.radius} mi</strong> of your address.
          </p>
          <Link href="/sell" className="mt-6 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-navy hover:bg-yellow-400 transition">
            Get Your Free Home Valuation
          </Link>
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
            Know When Your <span className="text-gold">Neighbors Sell</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Get instant WhatsApp alerts when homes sell near you — and what they sold for.
          </p>
        </div>
      </section>

      {/* Sign-up Form */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-lg px-4">
          <h2 className="text-2xl font-bold text-navy text-center mb-8">
            Get Comp Alerts Free
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Home Address *</label>
              <input
                type="text" required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text" required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Rutherford"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone Number *</label>
              <input
                type="tel" required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 201 555 1234"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-gray-400">(optional)</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Radius selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Radius</label>
              <div className="flex gap-4">
                {radiusOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio" name="radius"
                      value={opt.value}
                      checked={form.radius === opt.value}
                      onChange={(e) => setForm({ ...form, radius: e.target.value })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SMS/WhatsApp Consent */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-500 leading-relaxed">
                I consent to receive SMS/WhatsApp messages from Garden State AI
                about nearby home sales and real estate services.
                Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out.
                Your mobile info will not be shared with third parties.{" "}
                <a href="/privacy" target="_blank" className="underline hover:text-gray-700">Privacy Policy</a>
                {" & "}
                <a href="/terms" target="_blank" className="underline hover:text-gray-700">Terms</a>.
              </span>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit" disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {submitting ? "Subscribing..." : "Get Comp Alerts Free"}
            </button>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy mb-10">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">1</div>
              <h3 className="mt-3 font-semibold text-navy">A Home Near You Sells</h3>
              <p className="mt-2 text-sm text-gray-600">We detect it from MLS data within minutes of closing.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">2</div>
              <h3 className="mt-3 font-semibold text-navy">You Get a WhatsApp Alert</h3>
              <p className="mt-2 text-sm text-gray-600">Sale price, address, beds/baths — delivered straight to your phone.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">3</div>
              <h3 className="mt-3 font-semibold text-navy">See Your Home&apos;s Value</h3>
              <p className="mt-2 text-sm text-gray-600">Each sale affects YOUR home&apos;s value. We show you how.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-navy mb-10">Why This Matters</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {whyCards.map((card) => (
              <div key={card.title} className="rounded-2xl bg-white p-6 shadow-md text-center">
                <h3 className="font-semibold text-navy text-lg">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-white">
            Want to know your home&apos;s current value?
          </h2>
          <Link
            href="/sell"
            className="mt-6 inline-block rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-navy hover:bg-yellow-400 transition"
          >
            Get a Free Home Valuation
          </Link>
        </div>
      </section>
    </>
  );
}
