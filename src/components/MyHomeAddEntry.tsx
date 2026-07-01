"use client";

import { useState } from "react";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

// ── Shared constants (must match MyHomeLog.tsx) ─────────────

export interface HomeEntry {
  id: string;
  profile_id: string;
  title: string;
  category: string;
  system: string;
  date: string;
  cost: number;
  contractor_name: string | null;
  contractor_company: string | null;
  warranty_expiry: string | null;
  notes: string | null;
  photo_count: number;
  attachment_count: number;
  value_impact: number | null;
  recovery_pct: number | null;
  status: string;
  created_at: string;
}

const CATEGORIES: { key: string; label: string; icon: string; color: string }[] = [
  { key: "repair", label: "Repairs", icon: "\u{1F527}", color: "bg-orange-100 text-orange-700" },
  { key: "upgrade", label: "Upgrades", icon: "\u2728", color: "bg-green-100 text-green-700" },
  { key: "maintenance", label: "Maintenance", icon: "\u2699\uFE0F", color: "bg-blue-100 text-blue-700" },
  { key: "inspection", label: "Inspections", icon: "\u{1F4CB}", color: "bg-purple-100 text-purple-700" },
  { key: "permit", label: "Permits", icon: "\u{1F4C4}", color: "bg-gray-200 text-gray-700" },
  { key: "warranty", label: "Warranty", icon: "\u{1F6E1}\uFE0F", color: "bg-teal-100 text-teal-700" },
  { key: "document", label: "Documents", icon: "\u{1F4C1}", color: "bg-slate-100 text-slate-700" },
];

const SYSTEMS = [
  "Roof", "HVAC", "Kitchen", "Bathroom", "Plumbing", "Electrical",
  "Foundation", "Windows", "Flooring", "Exterior", "Landscaping", "Garage", "Other",
];

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function getCategoryStyle(cat: string) {
  return CATEGORIES.find((c) => c.key === cat) || CATEGORIES[0];
}

// ── Add/Edit Entry Modal ────────────────────────────────────

export default function MyHomeAddEntry({ profileId, entry, onClose, onSaved }: {
  profileId: string;
  entry: HomeEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!entry;
  const [title, setTitle] = useState(entry?.title || "");
  const [category, setCategory] = useState(entry?.category || "repair");
  const [system, setSystem] = useState(entry?.system || "Other");
  const [date, setDate] = useState(entry?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [cost, setCost] = useState(entry?.cost ? String(entry.cost) : "");
  const [contractorName, setContractorName] = useState(entry?.contractor_name || "");
  const [contractorCompany, setContractorCompany] = useState(entry?.contractor_company || "");
  const [warrantyExpiry, setWarrantyExpiry] = useState(entry?.warranty_expiry?.slice(0, 10) || "");
  const [notes, setNotes] = useState(entry?.notes || "");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ value_impact: number; recovery_pct: number } | null>(null);

  const showWarranty = ["repair", "upgrade", "maintenance"].includes(category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    const body = {
      profile_id: profileId,
      title: title.trim(),
      category,
      system,
      date,
      cost: cost ? Number(cost.replace(/[^0-9.]/g, "")) : 0,
      contractor_name: contractorName.trim() || null,
      contractor_company: contractorCompany.trim() || null,
      warranty_expiry: warrantyExpiry || null,
      notes: notes.trim() || null,
    };

    try {
      const url = isEdit
        ? `${IDX_API}/api/idx/myhome/entries/${entry!.id}`
        : `${IDX_API}/api/idx/myhome/entries`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (!isEdit && data.value_impact) {
          setResult({ value_impact: data.value_impact, recovery_pct: data.recovery_pct || 0 });
          setTimeout(() => onSaved(), 3000);
        } else {
          onSaved();
        }
      }
    } catch { /* silent */ }
    setSaving(false);
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            {getCategoryStyle(category).icon || "\u2705"}
          </div>
          <h3 className="mt-4 text-lg font-bold text-navy">{title} logged!</h3>
          <p className="mt-2 text-sm text-gray-600">
            Estimated value impact:{" "}
            <span className="font-bold text-green-600">+{fmt(result.value_impact)}</span>
            {result.recovery_pct > 0 && (
              <span className="text-gray-400"> ({result.recovery_pct}% recovery)</span>
            )}
          </p>
          <button onClick={onSaved}
            className="mt-6 w-full rounded-lg bg-gold px-4 py-3 font-bold text-navy hover:bg-yellow-400 transition">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-navy">{isEdit ? "Edit Entry" : "Add Entry"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="Kitchen countertop replacement"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gold focus:outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.key} type="button" onClick={() => setCategory(c.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    category === c.key ? "bg-navy text-white" : c.color + " hover:opacity-80"
                  }`}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">System</label>
              <select value={system} onChange={(e) => setSystem(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none">
                {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Cost ($)</label>
            <input type="text" value={cost} onChange={(e) => setCost(e.target.value)}
              placeholder="5,000"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gold focus:outline-none" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Contractor Name</label>
              <input type="text" value={contractorName} onChange={(e) => setContractorName(e.target.value)}
                placeholder="John's Plumbing"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gold focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Company</label>
              <input type="text" value={contractorCompany} onChange={(e) => setContractorCompany(e.target.value)}
                placeholder="ABC Contractors LLC"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gold focus:outline-none" />
            </div>
          </div>

          {showWarranty && (
            <div>
              <label className="text-sm font-medium text-gray-700">Warranty Expiry</label>
              <input type="date" value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Additional details..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gold focus:outline-none resize-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Photos</label>
            <div className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center">
              <div>
                <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-xs text-gray-400">Drag photos here or tap to upload</p>
                <p className="text-[10px] text-gray-300">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving || !title.trim()}
              className="flex-1 rounded-lg bg-gold px-4 py-3 text-sm font-bold text-navy hover:bg-yellow-400 disabled:opacity-40 transition">
              {saving ? "Saving..." : isEdit ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
