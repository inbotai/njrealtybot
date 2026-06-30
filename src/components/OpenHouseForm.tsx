"use client";

import { useState } from "react";
import { submitLead } from "@/lib/api";
import SmsConsent from "./SmsConsent";

interface OpenHouseFormProps {
  listingId: string;
  mlsNumber: string;
}

export default function OpenHouseForm({ listingId, mlsNumber }: OpenHouseFormProps) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    has_agent: "",
  });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!form.full_name.trim() || !form.phone.trim()) {
      setErrorMsg("Name and phone are required.");
      setStatus("error");
      return;
    }

    if (!consent) {
      setErrorMsg("Please accept the messaging consent to continue.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      await submitLead({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || undefined,
        message: `Open house visitor. MLS: ${mlsNumber}. Has agent: ${form.has_agent || "not specified"}`,
        listing_id: listingId,
        lead_type: "open_house_visitor",
        source: "open_house_qr",
      });
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-green-50 p-8 text-center">
        <div className="text-4xl mb-3">&#127881;</div>
        <p className="text-lg font-semibold text-green-800">
          Thanks {form.full_name.split(" ")[0]}!
        </p>
        <p className="mt-2 text-green-700">
          Check your phone for listing details. Enjoy the open house!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white p-5 shadow-lg">
      <h3 className="mb-1 text-lg font-bold text-navy">Sign In to the Open House</h3>
      <p className="mb-4 text-sm text-gray-500">Get listing details texted to you</p>

      <div className="space-y-3">
        <input
          required
          type="text"
          placeholder="Your Name"
          value={form.full_name}
          onChange={(e) => update("full_name", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <input
          required
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Are you working with an agent?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => update("has_agent", "yes")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                form.has_agent === "yes"
                  ? "border-gold bg-gold/10 text-navy"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => update("has_agent", "no")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                form.has_agent === "no"
                  ? "border-gold bg-gold/10 text-navy"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* What you get */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-1.5">What you&apos;ll receive:</p>
        <ul className="space-y-1 text-xs text-gray-600">
          <li className="flex items-center gap-1.5">
            <span className="text-gold">&#10003;</span> Listing details texted to you
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-gold">&#10003;</span> Neighborhood market report
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-gold">&#10003;</span> Notifications of similar homes
          </li>
        </ul>
      </div>

      <div className="mt-3">
        <SmsConsent checked={consent} onChange={setConsent} />
      </div>

      {status === "error" && errorMsg && (
        <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 w-full rounded-lg bg-gold py-3 font-semibold text-navy transition hover:bg-yellow-500 disabled:opacity-50"
      >
        {status === "loading" ? "Submitting..." : "Sign In"}
      </button>
    </form>
  );
}
