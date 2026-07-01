"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

// ── Types ───────────────────────────────────────────────────

interface AdminProfile {
  id: string;
  phone: string;
  name: string;
  address: string;
  city: string;
  estimated_value: number | null;
  entry_count: number;
  last_activity: string | null;
  flagged: boolean;
  created_at: string;
}

interface AdminEntry {
  id: string;
  profile_id: string;
  title: string;
  category: string;
  system: string;
  date: string;
  cost: number;
  contractor_name: string | null;
  value_impact: number | null;
  recovery_pct: number | null;
  status: string;
  created_at: string;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtShort(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysAgo(d: string): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400_000);
}

const catIcon: Record<string, string> = {
  repair: "\u{1F527}", upgrade: "\u2728", maintenance: "\u2699\uFE0F",
  inspection: "\u{1F4CB}", permit: "\u{1F4C4}", warranty: "\u{1F6E1}\uFE0F", document: "\u{1F4C1}",
};

// ── Component ───────────────────────────────────────────────

export default function MyHomeAdmin() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/admin/myhome/profiles?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || data || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  async function loadEntries(profileId: string) {
    setEntriesLoading(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/entries/${profileId}?status=active`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || data || []);
      } else {
        setEntries([]);
      }
    } catch { setEntries([]); }
    setEntriesLoading(false);
  }

  // ── Summary ───────────────────────────────────────────────

  const summary = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400_000;
    return {
      total: profiles.length,
      totalEntries: profiles.reduce((s, p) => s + (p.entry_count || 0), 0),
      newThisWeek: profiles.filter((p) => new Date(p.created_at).getTime() > weekAgo).length,
      flagged: profiles.filter((p) => p.flagged).length,
    };
  }, [profiles]);

  // ── Filter ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  }, [profiles, search]);

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">MyHome Admin</h1>
          <p className="text-sm text-gray-500">{summary.total} profiles, {summary.totalEntries} total entries</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
            Dashboard
          </a>
          <button onClick={loadProfiles} disabled={loading}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy hover:bg-yellow-400 transition disabled:opacity-40">
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Profiles" value={summary.total} />
        <StatCard label="Total Entries" value={summary.totalEntries} />
        <StatCard label="New This Week" value={summary.newThisWeek} highlight />
        <StatCard label="Flagged" value={summary.flagged} warn={summary.flagged > 0} />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, address, city..."
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Entries</th>
              <th className="px-4 py-3">Last Activity</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  {loading ? "Loading profiles..." : "No profiles found"}
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const isExpanded = expandedId === p.id;
              return (
                <ProfileRow
                  key={p.id}
                  profile={p}
                  isExpanded={isExpanded}
                  onToggle={() => {
                    if (isExpanded) { setExpandedId(null); }
                    else { setExpandedId(p.id); loadEntries(p.id); }
                  }}
                  entries={isExpanded ? entries : []}
                  entriesLoading={isExpanded ? entriesLoading : false}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
            {loading ? "Loading profiles..." : "No profiles found"}
          </div>
        )}
        {filtered.map((p) => {
          const isExpanded = expandedId === p.id;
          return (
            <div key={p.id} className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  if (isExpanded) { setExpandedId(null); }
                  else { setExpandedId(p.id); loadEntries(p.id); }
                }}>
                <div>
                  <p className="font-semibold text-navy text-sm">{p.name}</p>
                  <p className="text-[11px] text-gray-400">{p.address}, {p.city}</p>
                  <p className="text-[11px] text-gray-400">{p.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-navy">{p.entry_count}</p>
                  <p className="text-[10px] text-gray-400">entries</p>
                  {p.flagged && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Flagged</span>
                  )}
                </div>
              </div>
              {isExpanded && (
                <div className="border-t bg-gray-50 px-4 py-4">
                  <EntryTimeline entries={entries} loading={entriesLoading} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────

function StatCard({ label, value, highlight, warn }: {
  label: string; value: number; highlight?: boolean; warn?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ring-1 ${
      warn ? "bg-red-50 ring-red-200" : highlight ? "bg-green-50 ring-green-200" : "bg-white ring-gray-200"
    }`}>
      <div className={`text-2xl font-bold ${warn ? "text-red-600" : highlight ? "text-green-600" : "text-navy"}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

// ── Profile Table Row ───────────────────────────────────────

function ProfileRow({ profile: p, isExpanded, onToggle, entries, entriesLoading }: {
  profile: AdminProfile;
  isExpanded: boolean;
  onToggle: () => void;
  entries: AdminEntry[];
  entriesLoading: boolean;
}) {
  return (
    <>
      <tr className={`cursor-pointer transition hover:bg-gray-50 ${isExpanded ? "bg-gray-50" : ""}`} onClick={onToggle}>
        <td className="px-4 py-3">
          <div className="font-semibold text-navy">{p.name}</div>
          {p.flagged && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Flagged</span>}
        </td>
        <td className="px-4 py-3 text-gray-600">{p.address}, {p.city}</td>
        <td className="px-4 py-3 text-gray-600">{p.phone}</td>
        <td className="px-4 py-3 font-medium text-navy">{p.estimated_value ? fmt(p.estimated_value) : "--"}</td>
        <td className="px-4 py-3">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{p.entry_count}</span>
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">
          {p.last_activity ? <>{fmtShort(p.last_activity)} <span className="text-[10px]">({daysAgo(p.last_activity)}d ago)</span></> : "--"}
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(p.created_at)}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="border-t-0 bg-gray-50 px-4 py-4">
            <EntryTimeline entries={entries} loading={entriesLoading} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Entry Timeline (reusable) ───────────────────────────────

function EntryTimeline({ entries, loading }: { entries: AdminEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex h-16 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="text-xs text-gray-400">No entries recorded</p>;
  }

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
        Entry Timeline ({entries.length} total)
      </p>
      {sorted.map((e) => (
        <div key={e.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 border border-gray-200 text-xs">
          <span className="text-base">{catIcon[e.category] || "\u{1F3E0}"}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-navy truncate">{e.title}</p>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{fmtShort(e.date)}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px]">{e.system}</span>
              {e.contractor_name && <span className="truncate">{e.contractor_name}</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            {e.cost > 0 && <p className="font-semibold text-navy">{fmt(e.cost)}</p>}
            {e.value_impact != null && e.value_impact > 0 && (
              <p className="text-[10px] text-green-600">+{fmt(e.value_impact)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
