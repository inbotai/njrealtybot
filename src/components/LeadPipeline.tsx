"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

// ── Types ───────────────────────────────────────────────────

interface Lead {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  lead_type: string;
  source: string;
  status: string;
  created_at: string;
  // FRES fields (may be null if migration not applied yet)
  bucket?: string | null;
  bucket_reason?: string | null;
  lead_score?: number | null;
  timeline?: string | null;
  pre_approved?: boolean | null;
  owns_home?: boolean | null;
  has_agent?: boolean | null;
  client_type?: string | null;
}

interface FollowUp {
  id: string;
  lead_id: string | null;
  phone: string;
  lead_name: string | null;
  follow_up_date: string;
  follow_up_type: string;
  status: string;
  channel: string;
  sent_at: string | null;
}

interface DripCampaign {
  id: string;
  lead_id: string | null;
  phone: string;
  lead_name: string | null;
  campaign_type: string;
  step: number;
  max_steps: number;
  status: string;
  next_send_date: string | null;
  address: string | null;
  city: string | null;
}

interface ChatMessage {
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

type SortField = "name" | "score" | "bucket" | "date" | "source" | "type";
type SortDir = "asc" | "desc";
type BucketFilter = "all" | "now" | "future" | "none" | "unclassified";

// ── Helpers ─────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function fmtShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

function daysAgo(d: string): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400_000);
}

const bucketConfig: Record<string, { label: string; icon: string; bg: string; text: string; ring: string }> = {
  now:            { label: "NOW",          icon: "🔥", bg: "bg-red-50",    text: "text-red-700",    ring: "ring-red-200" },
  future:         { label: "FUTURE",       icon: "📋", bg: "bg-blue-50",   text: "text-blue-700",   ring: "ring-blue-200" },
  none:           { label: "NONE",         icon: "❌", bg: "bg-gray-50",   text: "text-gray-500",   ring: "ring-gray-200" },
  unclassified:   { label: "NEW",          icon: "❓", bg: "bg-amber-50",  text: "text-amber-700",  ring: "ring-amber-200" },
};

const clientTypeBadge: Record<string, { label: string; color: string }> = {
  buyer:     { label: "Buyer",     color: "bg-emerald-100 text-emerald-700" },
  seller:    { label: "Seller",    color: "bg-purple-100 text-purple-700" },
  renter:    { label: "Renter",    color: "bg-sky-100 text-sky-700" },
  investor:  { label: "Investor",  color: "bg-indigo-100 text-indigo-700" },
  homeowner: { label: "Homeowner", color: "bg-amber-100 text-amber-700" },
};

const sourceLabels: Record<string, string> = {
  webchat_vale: "Webchat", whatsapp_vale: "WhatsApp", sms_vale: "SMS",
  idx_website: "Website", tax_shock_tool: "Tax Shock", neighborhood_alerts: "Alerts",
  instant_valuation: "Valuation", sell_score_send: "Sell Score", tax_shock_tool_send: "Tax Shock",
  deals_page: "Deals", buyer_match: "Buyer Match", affordability_calc: "Affordability",
  sell_timing: "Sell Timing", renovate_sim: "Renovate", tax_appeal_wizard: "Tax Appeal",
};

function scoreColor(score: number | null | undefined): string {
  if (score == null) return "text-gray-400";
  if (score >= 80) return "text-emerald-600";
  if (score >= 40) return "text-amber-500";
  return "text-gray-400";
}

function scoreBg(score: number | null | undefined): string {
  if (score == null) return "bg-gray-100";
  if (score >= 80) return "bg-emerald-50";
  if (score >= 40) return "bg-amber-50";
  return "bg-gray-100";
}

// ── Component ───────────────────────────────────────────────

export default function LeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [drips, setDrips] = useState<DripCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Data loading ────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, followUpsRes, dripsRes] = await Promise.all([
        fetch(`${IDX_API}/api/idx/admin/leads?limit=100`),
        fetch(`${IDX_API}/api/idx/admin/follow-ups`).catch(() => null),
        fetch(`${IDX_API}/api/idx/admin/drip-campaigns`).catch(() => null),
      ]);
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }
      if (followUpsRes?.ok) {
        const data = await followUpsRes.json();
        setFollowUps(data.follow_ups || data || []);
      }
      if (dripsRes?.ok) {
        const data = await dripsRes.json();
        setDrips(data.campaigns || data || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Chat loading ────────────────────────────────────────────

  async function loadChat(phone: string) {
    setChatLoading(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/admin/chat-by-phone/${encodeURIComponent(phone)}`);
      if (res.ok) setChatMessages((await res.json()).messages || []);
      else setChatMessages([]);
    } catch { setChatMessages([]); }
    setChatLoading(false);
  }

  // ── Summary counts ──────────────────────────────────────────

  const summary = useMemo(() => {
    const counts = { now: 0, future: 0, none: 0, unclassified: 0, total: leads.length, thisWeek: 0, thisMonth: 0 };
    const weekAgo = Date.now() - 7 * 86400_000;
    const monthAgo = Date.now() - 30 * 86400_000;
    for (const l of leads) {
      const b = l.bucket || "unclassified";
      if (b in counts) counts[b as keyof typeof counts]++;
      const ts = new Date(l.created_at).getTime();
      if (ts > weekAgo) counts.thisWeek++;
      if (ts > monthAgo) counts.thisMonth++;
    }
    return counts;
  }, [leads]);

  // ── Unique sources for filter dropdown ──────────────────────

  const uniqueSources = useMemo(() => {
    const s = new Set(leads.map(l => l.source).filter(Boolean));
    return Array.from(s).sort();
  }, [leads]);

  const uniqueTypes = useMemo(() => {
    const s = new Set(leads.map(l => l.client_type).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [leads]);

  // ── Sorting + filtering ─────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...leads];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        (l.full_name || "").toLowerCase().includes(q) ||
        (l.phone || "").includes(q) ||
        (l.email || "").toLowerCase().includes(q)
      );
    }

    // Bucket filter
    if (bucketFilter !== "all") {
      result = result.filter(l => (l.bucket || "unclassified") === bucketFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      result = result.filter(l => l.source === sourceFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(l => l.client_type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = (a.full_name || "").localeCompare(b.full_name || "");
          break;
        case "score":
          cmp = (a.lead_score ?? -1) - (b.lead_score ?? -1);
          break;
        case "bucket": {
          const order = { now: 0, future: 1, unclassified: 2, none: 3 };
          cmp = (order[a.bucket as keyof typeof order] ?? 2) - (order[b.bucket as keyof typeof order] ?? 2);
          break;
        }
        case "date":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "source":
          cmp = (a.source || "").localeCompare(b.source || "");
          break;
        case "type":
          cmp = (a.client_type || "").localeCompare(b.client_type || "");
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [leads, search, bucketFilter, sourceFilter, typeFilter, sortField, sortDir]);

  // ── Sort toggle ─────────────────────────────────────────────

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return "";
    return sortDir === "desc" ? " ↓" : " ↑";
  }

  // ── Find follow-ups / drips for a lead ──────────────────────

  function getFollowUps(lead: Lead): FollowUp[] {
    if (!lead.phone) return [];
    const cleaned = lead.phone.replace(/\D/g, "").slice(-10);
    return followUps.filter(f => f.phone.replace(/\D/g, "").slice(-10) === cleaned);
  }

  function getDrips(lead: Lead): DripCampaign[] {
    if (!lead.phone) return [];
    const cleaned = lead.phone.replace(/\D/g, "").slice(-10);
    return drips.filter(d => d.phone.replace(/\D/g, "").slice(-10) === cleaned);
  }

  // ── Mark contacted ──────────────────────────────────────────

  async function markContacted(id: string) {
    try {
      await fetch(`${IDX_API}/api/idx/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "contacted" }),
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: "contacted" } : l));
    } catch { /* silent */ }
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Lead Pipeline</h1>
          <p className="text-sm text-gray-500">
            F.R.E.S. Classification &mdash; {summary.total} leads total
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/admin" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
            Dashboard
          </a>
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy hover:bg-yellow-400 transition disabled:opacity-40"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {(["now", "future", "none", "unclassified"] as const).map(b => {
          const cfg = bucketConfig[b];
          const count = summary[b];
          return (
            <button
              key={b}
              onClick={() => setBucketFilter(bucketFilter === b ? "all" : b)}
              className={`rounded-xl p-4 shadow-sm transition ring-1 ${cfg.bg} ${cfg.ring} ${
                bucketFilter === b ? "ring-2 ring-navy shadow-md" : "hover:shadow-md"
              }`}
            >
              <div className="text-2xl font-bold flex items-center gap-1">
                <span>{cfg.icon}</span>
                <span className={cfg.text}>{count}</span>
              </div>
              <div className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</div>
            </button>
          );
        })}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="text-2xl font-bold text-navy">{summary.thisWeek}</div>
          <div className="text-xs text-gray-500">This Week</div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="text-2xl font-bold text-navy">{summary.thisMonth}</div>
          <div className="text-xs text-gray-500">This Month</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, phone, email..."
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <select
          value={bucketFilter}
          onChange={e => setBucketFilter(e.target.value as BucketFilter)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gold focus:outline-none"
        >
          <option value="all">All Buckets</option>
          <option value="now">NOW</option>
          <option value="future">FUTURE</option>
          <option value="none">NONE</option>
          <option value="unclassified">NEW</option>
        </select>
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gold focus:outline-none"
        >
          <option value="all">All Sources</option>
          {uniqueSources.map(s => (
            <option key={s} value={s}>{sourceLabels[s] || s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gold focus:outline-none"
        >
          <option value="all">All Types</option>
          {uniqueTypes.map(t => (
            <option key={t} value={t}>{clientTypeBadge[t]?.label || t}</option>
          ))}
        </select>
      </div>

      {/* Lead Table (Desktop) */}
      <div className="hidden md:block overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 cursor-pointer hover:text-navy" onClick={() => toggleSort("name")}>
                Name{sortIndicator("name")}
              </th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 cursor-pointer hover:text-navy" onClick={() => toggleSort("score")}>
                Score{sortIndicator("score")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-navy" onClick={() => toggleSort("bucket")}>
                Bucket{sortIndicator("bucket")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-navy" onClick={() => toggleSort("type")}>
                Type{sortIndicator("type")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-navy" onClick={() => toggleSort("source")}>
                Source{sortIndicator("source")}
              </th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 cursor-pointer hover:text-navy" onClick={() => toggleSort("date")}>
                Date{sortIndicator("date")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  {loading ? "Loading leads..." : "No leads found"}
                </td>
              </tr>
            )}
            {filtered.map(lead => {
              const bucket = lead.bucket || "unclassified";
              const cfg = bucketConfig[bucket] || bucketConfig.unclassified;
              const isExpanded = expandedId === lead.id;
              return (
                <LeadTableRow
                  key={lead.id}
                  lead={lead}
                  cfg={cfg}
                  bucket={bucket}
                  isExpanded={isExpanded}
                  onToggle={() => {
                    if (isExpanded) { setExpandedId(null); }
                    else { setExpandedId(lead.id); if (lead.phone) loadChat(lead.phone); }
                  }}
                  followUps={getFollowUps(lead)}
                  drips={getDrips(lead)}
                  chatMessages={isExpanded ? chatMessages : []}
                  chatLoading={isExpanded ? chatLoading : false}
                  onMarkContacted={() => markContacted(lead.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lead Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
            {loading ? "Loading leads..." : "No leads found"}
          </div>
        )}
        {filtered.map(lead => {
          const bucket = lead.bucket || "unclassified";
          const cfg = bucketConfig[bucket] || bucketConfig.unclassified;
          const isExpanded = expandedId === lead.id;
          return (
            <LeadMobileCard
              key={lead.id}
              lead={lead}
              cfg={cfg}
              bucket={bucket}
              isExpanded={isExpanded}
              onToggle={() => {
                if (isExpanded) { setExpandedId(null); }
                else { setExpandedId(lead.id); if (lead.phone) loadChat(lead.phone); }
              }}
              followUps={getFollowUps(lead)}
              drips={getDrips(lead)}
              chatMessages={isExpanded ? chatMessages : []}
              chatLoading={isExpanded ? chatLoading : false}
              onMarkContacted={() => markContacted(lead.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Desktop Table Row ─────────────────────────────────────────

function LeadTableRow({ lead, cfg, bucket, isExpanded, onToggle, followUps, drips, chatMessages, chatLoading, onMarkContacted }: {
  lead: Lead;
  cfg: (typeof bucketConfig)["now"];
  bucket: string;
  isExpanded: boolean;
  onToggle: () => void;
  followUps: FollowUp[];
  drips: DripCampaign[];
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  onMarkContacted: () => void;
}) {
  return (
    <>
      <tr
        className={`cursor-pointer transition hover:bg-gray-50 ${isExpanded ? "bg-gray-50" : ""}`}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="font-semibold text-navy">{lead.full_name || "Unknown"}</div>
          {lead.email && <div className="text-[11px] text-gray-400">{lead.email}</div>}
        </td>
        <td className="px-4 py-3 text-gray-600">
          {lead.phone ? (
            <a href={`tel:${lead.phone}`} className="hover:text-gold" onClick={e => e.stopPropagation()}>
              {lead.phone}
            </a>
          ) : "—"}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${scoreBg(lead.lead_score)} ${scoreColor(lead.lead_score)}`}>
            {lead.lead_score != null ? lead.lead_score : "—"}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
            {cfg.icon} {cfg.label}
          </span>
        </td>
        <td className="px-4 py-3">
          {lead.client_type ? (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${clientTypeBadge[lead.client_type]?.color || "bg-gray-100 text-gray-600"}`}>
              {clientTypeBadge[lead.client_type]?.label || lead.client_type}
            </span>
          ) : <span className="text-gray-300">—</span>}
        </td>
        <td className="px-4 py-3">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">
            {sourceLabels[lead.source] || lead.source}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            lead.status === "new" ? "bg-green-100 text-green-700" :
            lead.status === "contacted" ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {lead.status}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">
          <div>{fmtDate(lead.created_at)}</div>
          <div className="text-[10px]">{daysAgo(lead.created_at)}d ago</div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={8} className="border-t-0 bg-gray-50 px-4 py-4">
            <LeadDetail
              lead={lead}
              followUps={followUps}
              drips={drips}
              chatMessages={chatMessages}
              chatLoading={chatLoading}
              onMarkContacted={onMarkContacted}
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Mobile Card ───────────────────────────────────────────────

function LeadMobileCard({ lead, cfg, bucket, isExpanded, onToggle, followUps, drips, chatMessages, chatLoading, onMarkContacted }: {
  lead: Lead;
  cfg: (typeof bucketConfig)["now"];
  bucket: string;
  isExpanded: boolean;
  onToggle: () => void;
  followUps: FollowUp[];
  drips: DripCampaign[];
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  onMarkContacted: () => void;
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
            bucket === "now" ? "bg-red-500" : bucket === "future" ? "bg-blue-500" : bucket === "none" ? "bg-gray-400" : "bg-amber-500"
          }`}>
            {(lead.full_name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-navy text-sm">{lead.full_name || "Unknown"}</div>
            <div className="text-[11px] text-gray-400">{lead.phone || "no phone"}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
            {cfg.icon} {cfg.label}
          </span>
          <div className="flex items-center gap-2">
            {lead.lead_score != null && (
              <span className={`text-xs font-bold ${scoreColor(lead.lead_score)}`}>{lead.lead_score}</span>
            )}
            <span className="text-[10px] text-gray-400">{fmtShortDate(lead.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-2">
        {lead.client_type && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${clientTypeBadge[lead.client_type]?.color || "bg-gray-100 text-gray-600"}`}>
            {clientTypeBadge[lead.client_type]?.label || lead.client_type}
          </span>
        )}
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700">
          {sourceLabels[lead.source] || lead.source}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
          lead.status === "new" ? "bg-green-100 text-green-700" :
          lead.status === "contacted" ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-600"
        }`}>
          {lead.status}
        </span>
      </div>

      {isExpanded && (
        <div className="border-t bg-gray-50 px-4 py-4">
          <LeadDetail
            lead={lead}
            followUps={followUps}
            drips={drips}
            chatMessages={chatMessages}
            chatLoading={chatLoading}
            onMarkContacted={onMarkContacted}
          />
        </div>
      )}
    </div>
  );
}

// ── Lead Detail Panel ─────────────────────────────────────────

function LeadDetail({ lead, followUps, drips, chatMessages, chatLoading, onMarkContacted }: {
  lead: Lead;
  followUps: FollowUp[];
  drips: DripCampaign[];
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  onMarkContacted: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Qualification Info */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <QualCard label="Timeline" value={lead.timeline || "—"} />
        <QualCard label="Pre-Approved" value={lead.pre_approved == null ? "—" : lead.pre_approved ? "Yes" : "No"} highlight={lead.pre_approved === true} />
        <QualCard label="Owns Home" value={lead.owns_home == null ? "—" : lead.owns_home ? "Yes" : "No"} />
        <QualCard label="Has Agent" value={lead.has_agent == null ? "—" : lead.has_agent ? "Yes" : "No"} warn={lead.has_agent === true} />
        <QualCard label="Score Reason" value={lead.bucket_reason || "—"} wide />
      </div>

      {/* Interest / Message */}
      {lead.message && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Interest</p>
          <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">{lead.message}</p>
        </div>
      )}

      {/* Follow-ups */}
      {followUps.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Follow-up Schedule</p>
          <div className="space-y-1">
            {followUps.map(f => (
              <div key={f.id} className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className={`h-2 w-2 rounded-full ${
                  f.status === "pending" ? "bg-amber-400" : f.status === "sent" ? "bg-green-400" : "bg-gray-300"
                }`} />
                <span className="font-medium text-gray-700">{fmtShortDate(f.follow_up_date)}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">{f.follow_up_type.replace("_", " ")}</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">{f.channel}</span>
                <span className={`ml-auto text-[10px] ${f.status === "pending" ? "text-amber-600" : "text-gray-400"}`}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drip Campaigns */}
      {drips.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Drip Campaigns</p>
          <div className="space-y-1">
            {drips.map(d => (
              <div key={d.id} className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className={`h-2 w-2 rounded-full ${
                  d.status === "active" ? "bg-green-400" : d.status === "paused" ? "bg-amber-400" : "bg-gray-300"
                }`} />
                <span className="font-medium text-gray-700">{d.campaign_type.replace("_", " ")}</span>
                <span className="text-gray-400">Step {d.step}/{d.max_steps}</span>
                {/* Progress bar */}
                <div className="flex-1 max-w-[100px]">
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-gold transition-all"
                      style={{ width: `${Math.round((d.step / d.max_steps) * 100)}%` }}
                    />
                  </div>
                </div>
                {d.next_send_date && (
                  <span className="text-[10px] text-gray-400">Next: {fmtShortDate(d.next_send_date)}</span>
                )}
                <span className={`ml-auto text-[10px] ${d.status === "active" ? "text-green-600" : "text-gray-400"}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Recent Conversation</p>
        {chatLoading ? (
          <div className="flex h-16 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : chatMessages.length === 0 ? (
          <p className="text-xs text-gray-400 bg-white rounded-lg p-3 border border-gray-200">No conversation recorded</p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1 bg-white rounded-lg p-3 border border-gray-200">
            {chatMessages.slice(-6).map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-1.5 text-xs ${
                  m.role === "user" ? "bg-navy text-white" : "bg-gray-100 text-gray-800"
                }`}>
                  <p className="whitespace-pre-wrap break-words">{m.content.slice(0, 300)}{m.content.length > 300 ? "..." : ""}</p>
                  <p className={`mt-0.5 text-[9px] ${m.role === "user" ? "text-gray-300" : "text-gray-400"}`}>{fmtDate(m.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {lead.status === "new" && (
          <button
            onClick={onMarkContacted}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition"
          >
            Mark Contacted
          </button>
        )}
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="rounded-lg bg-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-navy/80 transition"
          >
            Call Now
          </a>
        )}
        {lead.phone && (
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition"
          >
            WhatsApp
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Email
          </a>
        )}
      </div>
    </div>
  );
}

// ── Qualification Card ────────────────────────────────────────

function QualCard({ label, value, highlight, warn, wide }: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-2.5 ${
      highlight ? "border-emerald-200 bg-emerald-50" :
      warn ? "border-red-200 bg-red-50" :
      "border-gray-200 bg-white"
    } ${wide ? "col-span-2 sm:col-span-1 lg:col-span-2" : ""}`}>
      <div className="text-[10px] font-medium uppercase text-gray-400">{label}</div>
      <div className={`text-sm font-semibold ${
        highlight ? "text-emerald-700" :
        warn ? "text-red-600" :
        value === "—" ? "text-gray-300" : "text-navy"
      }`}>
        {value}
      </div>
    </div>
  );
}
