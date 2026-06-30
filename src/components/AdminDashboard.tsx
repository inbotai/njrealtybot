"use client";

import { useEffect, useState } from "react";
import AdminBlogTab from "./AdminBlogTab";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  lead_type: string;
  source: string;
  status: string;
  created_at: string;
}

interface IdxUser {
  id: string;
  phone: string;
  full_name: string | null;
  email: string | null;
  favorite_towns: string[];
  previous_searches: { type: string; query: string; result_summary?: string; timestamp: string }[];
  lead_score: number;
  first_interaction: string;
  last_interaction: string;
  total_interactions: number;
}

interface ChatMessage {
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Stats {
  activeListings: number;
  totalLeads: number;
  newLeads: number;
  totalUsers: number;
  activeSessions: number;
}

type Tab = "leads" | "contacts" | "blog";

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<IdxUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<Tab>("leads");
  const [loading, setLoading] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const DEFAULT_PASSWORDS = ["vale2026", "Vale2026!@1", "gardenstate2026"];

  function getValidPasswords(): string[] {
    try {
      const custom = localStorage.getItem("admin_password");
      return custom ? [custom, ...DEFAULT_PASSWORDS] : DEFAULT_PASSWORDS;
    } catch { return DEFAULT_PASSWORDS; }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (getValidPasswords().includes(password.trim())) {
      setAuthed(true); setLoginError(false);
      try { localStorage.setItem("admin_auth", "1"); } catch {}
    } else { setLoginError(true); }
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) { setPasswordMsg("Minimum 6 characters"); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg("Passwords don't match"); return; }
    try { localStorage.setItem("admin_password", newPassword); } catch {}
    setPasswordMsg("Password updated!");
    setNewPassword(""); setConfirmPassword("");
    setTimeout(() => { setShowChangePassword(false); setPasswordMsg(""); }, 1500);
  }

  useEffect(() => { try { if (localStorage.getItem("admin_auth") === "1") setAuthed(true); } catch {} }, []);
  useEffect(() => { if (authed) loadData(); }, [authed, tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === "leads") {
        const [leadsRes, usersRes] = await Promise.all([
          fetch(`${IDX_API}/api/idx/admin/leads?limit=100`),
          fetch(`${IDX_API}/api/idx/admin/users`),
        ]);
        if (leadsRes.ok) setLeads((await leadsRes.json()).leads || []);
        if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      } else if (tab === "contacts") {
        const res = await fetch(`${IDX_API}/api/idx/admin/users`);
        if (res.ok) setUsers((await res.json()).users || []);
      }
      const statsRes = await fetch(`${IDX_API}/api/idx/admin/stats`);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <form onSubmit={handleLogin} className="w-80 space-y-4 rounded-xl bg-white p-8 shadow-lg">
          <h2 className="text-xl font-bold text-navy">Admin Access</h2>
          <input type="password" value={password}
            onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
            placeholder="Password"
            className={`w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500 ${loginError ? "border-red-400" : ""}`}
            autoFocus />
          {loginError && <p className="text-sm text-red-500">Incorrect password</p>}
          <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700">Login</button>
        </form>
      </div>
    );
  }

  const typeLabels: Record<string, { label: string; color: string }> = {
    showing_request: { label: "Showing", color: "bg-emerald-100 text-emerald-800" },
    info_request: { label: "Info", color: "bg-blue-100 text-blue-800" },
    tool_result: { label: "Tool", color: "bg-purple-100 text-purple-800" },
    alert_subscriber: { label: "Alert", color: "bg-amber-100 text-amber-800" },
    valuation_request: { label: "Valuation", color: "bg-indigo-100 text-indigo-800" },
  };

  const sourceLabels: Record<string, string> = {
    webchat_vale: "Webchat", whatsapp_vale: "WhatsApp", sms_vale: "SMS",
    idx_website: "Website", tax_shock_tool: "Tax Shock", neighborhood_alerts: "Alerts",
    instant_valuation: "Valuation", sell_score_send: "Sell Score", tax_shock_tool_send: "Tax Shock",
    deals_page: "Deals", buyer_match: "Buyer Match", affordability_calc: "Affordability",
    sell_timing: "Sell Timing", renovate_sim: "Renovate", tax_appeal_wizard: "Tax Appeal",
  };

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`${IDX_API}/api/idx/admin/leads/${id}`, { method: "DELETE" }).catch(() => {});
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this contact and ALL their data?")) return;
    await fetch(`${IDX_API}/api/idx/admin/users/${id}`, { method: "DELETE" }).catch(() => {});
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  async function deleteAllData() {
    if (!confirm("DELETE ALL leads, contacts, and chat messages? CANNOT be undone.")) return;
    if (!confirm("Are you SURE?")) return;
    try {
      const leadsRes = await fetch(`${IDX_API}/api/idx/admin/leads/all`, { method: "DELETE" });
      const leadsData = leadsRes.ok ? await leadsRes.json() : null;
      for (const u of users) {
        await fetch(`${IDX_API}/api/idx/admin/users/${u.id}`, { method: "DELETE" });
      }
      setUsers([]); setLeads([]);
      alert(`Deleted ${leadsData?.deleted || 0} leads and ${users.length} contacts.`);
    } catch {
      alert("Some deletions may have failed. Refresh to check.");
    }
  }

  async function viewChat(phone: string) {
    setChatLoading(true);
    try {
      const res = await fetch(`${IDX_API}/api/idx/admin/chat-by-phone/${encodeURIComponent(phone)}`);
      if (res.ok) setChatMessages((await res.json()).messages || []);
      else setChatMessages([]);
    } catch { setChatMessages([]); }
    setChatLoading(false);
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  // Find user record for a lead (by phone)
  function findUser(phone: string | null): IdxUser | undefined {
    if (!phone) return undefined;
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    return users.find(u => u.phone.replace(/\D/g, "").slice(-10) === cleaned);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Garden State AI — Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowChangePassword(true)} className="text-sm text-gray-500 hover:text-indigo-600">Change Password</button>
          <button onClick={() => { try { localStorage.removeItem("admin_auth"); } catch {} setAuthed(false); }}
            className="text-sm text-gray-500 hover:text-red-600">Logout</button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-2xl font-bold text-green-600">{leads.length || stats.newLeads || 0}</div>
            <div className="text-xs text-gray-500">Leads</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-2xl font-bold text-indigo-600">{users.length || stats.totalUsers || 0}</div>
            <div className="text-xs text-gray-500">Contacts</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.activeListings || 0}</div>
            <div className="text-xs text-gray-500">Active Listings</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-2xl font-bold text-amber-600">{stats.activeSessions || 0}</div>
            <div className="text-xs text-gray-500">Active Chats</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {(["leads", "contacts", "blog"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-white shadow text-navy" : "text-gray-500"}`}>
            {t === "leads" ? `Leads (${leads.length})` : t === "contacts" ? `Contacts (${users.length})` : "Blog"}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="mb-4 flex justify-end gap-2">
        <button onClick={deleteAllData} className="rounded-lg border border-red-200 px-4 py-1.5 text-sm text-red-500 hover:bg-red-50">Delete All</button>
        <button onClick={loadData} disabled={loading} className="rounded-lg border px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ── LEADS TAB ── */}
      {tab === "leads" && (
        <div className="space-y-3">
          {leads.length === 0 && (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow">No leads yet</div>
          )}
          {leads.map((lead) => {
            const user = findUser(lead.phone);
            const type = typeLabels[lead.lead_type] || { label: lead.lead_type, color: "bg-gray-100 text-gray-600" };
            const isExpanded = expandedLead === lead.id;
            return (
              <div key={lead.id} className="rounded-xl bg-white shadow overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => { setExpandedLead(isExpanded ? null : lead.id); if (!isExpanded && lead.phone) viewChat(lead.phone); }}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                      lead.lead_type === "showing_request" ? "bg-emerald-500" : "bg-indigo-500"
                    }`}>
                      {(lead.full_name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-navy">{lead.full_name || "Unknown"}</div>
                      <div className="text-xs text-gray-400">
                        {lead.phone || "no phone"} {lead.email ? `| ${lead.email}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${type.color}`}>{type.label}</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                      {sourceLabels[lead.source] || lead.source}
                    </span>
                    <span className="text-gray-400">{fmtDate(lead.created_at)}</span>
                    <span className="text-lg text-gray-300">{isExpanded ? "−" : "+"}</span>
                  </div>
                </div>

                {/* Expanded: message + conversation + actions */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 px-5 py-4 space-y-4">
                    {/* Interest/Message */}
                    {lead.message && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Interest</p>
                        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border">{lead.message}</p>
                      </div>
                    )}

                    {/* User search history if available */}
                    {user && user.previous_searches?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Search History</p>
                        <div className="space-y-1">
                          {user.previous_searches.slice(-5).reverse().map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs bg-white rounded px-3 py-1.5 border">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                s.type === "cma" ? "bg-purple-100 text-purple-700" :
                                s.type === "tax_appeal" ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"}`}>{s.type}</span>
                              <span className="flex-1">{s.query}</span>
                              {s.result_summary && <span className="text-green-600">{s.result_summary}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conversation */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Conversation</p>
                      {chatLoading ? (
                        <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
                      ) : chatMessages.length === 0 ? (
                        <p className="text-xs text-gray-400 bg-white rounded-lg p-3 border">No conversation recorded</p>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-1.5 bg-white rounded-lg p-3 border">
                          {chatMessages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] rounded-lg px-3 py-1.5 text-xs ${
                                m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                              }`}>
                                <p className="whitespace-pre-wrap">{m.content}</p>
                                <p className={`mt-0.5 text-[9px] ${m.role === "user" ? "text-indigo-200" : "text-gray-400"}`}>{fmtDate(m.created_at)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => deleteLead(lead.id)}
                        className="rounded-lg bg-red-50 px-4 py-1.5 text-xs text-red-600 hover:bg-red-100">Delete Lead</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── CONTACTS TAB ── */}
      {tab === "contacts" && (
        <div className="space-y-3">
          {users.length === 0 && (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow">No contacts yet</div>
          )}
          {users.map((u) => (
            <div key={u.id} className="rounded-xl bg-white shadow overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    {(u.full_name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-navy">{u.full_name || "Unknown"}</div>
                    <div className="text-xs text-gray-400">{u.phone} {u.email ? `| ${u.email}` : ""}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">{u.total_interactions}</div>
                    <div>visits</div>
                  </div>
                  {u.favorite_towns?.length > 0 && (
                    <div className="hidden md:flex gap-1">
                      {u.favorite_towns.map(t => (
                        <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="text-right text-[10px]">
                    <div>Last: {fmtDate(u.last_interaction)}</div>
                    <div>First: {fmtDate(u.first_interaction)}</div>
                  </div>
                  <span className="text-lg">{expandedUser === u.id ? "−" : "+"}</span>
                </div>
              </div>

              {expandedUser === u.id && (
                <div className="border-t bg-gray-50 px-5 py-4 space-y-3">
                  {u.previous_searches?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Activity</p>
                      <div className="space-y-1">
                        {u.previous_searches.slice().reverse().map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs bg-white rounded px-3 py-1.5 border">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              s.type === "cma" ? "bg-purple-100 text-purple-700" :
                              s.type === "search" ? "bg-blue-100 text-blue-700" :
                              s.type === "tax_appeal" ? "bg-red-100 text-red-700" :
                              "bg-green-100 text-green-700"}`}>{s.type}</span>
                            <span className="flex-1">{s.query}</span>
                            {s.result_summary && <span className="text-green-600 font-semibold">{s.result_summary}</span>}
                            <span className="text-gray-400">{fmtDate(s.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); viewChat(u.phone); setExpandedLead("chat-" + u.id); }}
                      className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs text-white hover:bg-indigo-700">View Conversations</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteUser(u.id); }}
                      className="rounded-lg bg-red-50 px-4 py-1.5 text-xs text-red-600 hover:bg-red-100">Delete Contact</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "blog" && <AdminBlogTab password={password || "vale2026"} />}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowChangePassword(false)}>
          <form onSubmit={handleChangePassword} onClick={e => e.stopPropagation()}
            className="w-96 space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-navy">Change Password</h3>
            <input type="password" placeholder="New password" value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setPasswordMsg(""); }}
              className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500" autoFocus />
            <input type="password" placeholder="Confirm password" value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setPasswordMsg(""); }}
              className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500" />
            {passwordMsg && <p className={`text-sm ${passwordMsg === "Password updated!" ? "text-green-600" : "text-red-500"}`}>{passwordMsg}</p>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700">Save</button>
              <button type="button" onClick={() => setShowChangePassword(false)} className="flex-1 rounded-lg border py-2 text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
