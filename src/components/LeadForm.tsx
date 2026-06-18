"use client";

import { useState } from "react";
import { submitLead, type LeadData } from "@/lib/api";

interface LeadFormProps {
  leadType: LeadData["lead_type"];
  listingId?: string;
  title?: string;
}

export default function LeadForm({
  leadType,
  listingId,
  title = "Get in Touch",
}: LeadFormProps) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitLead({
        ...form,
        lead_type: leadType,
        listing_id: listingId,
      });
      setStatus("success");
      setForm({ full_name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-green-50 p-8 text-center">
        <p className="text-lg font-semibold text-green-800">
          Thank you! We&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <h3 className="mb-4 text-lg font-bold text-navy">{title}</h3>

      <div className="space-y-3">
        <input
          required
          type="text"
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) => update("full_name", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <textarea
          placeholder="Message"
          rows={3}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <label className="mt-3 flex items-start gap-2 cursor-pointer">
        <input type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" />
        <span className="text-[10px] text-gray-500 leading-relaxed">
          I consent to receive SMS/WhatsApp messages from Garden State AI
          about real estate services. Msg frequency varies. Msg &amp; data rates may apply.
          Reply STOP to opt out. Your mobile info will not be shared with third parties.{" "}
          <a href="/privacy" target="_blank" className="underline hover:text-gray-700">Privacy Policy</a>
          {" & "}
          <a href="/terms" target="_blank" className="underline hover:text-gray-700">Terms</a>.
        </span>
      </label>

      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 w-full rounded-lg bg-gold py-3 font-semibold text-navy transition hover:bg-yellow-500 disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
