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

interface ChatSession {
  id: string;
  phone_number: string;
  visitor_name: string | null;
  session_id: string;
  created_at: string;
  last_message_at: string;
  expired: boolean;
  lead_captured: boolean;
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

type Tab = "users" | "leads" | "sessions" | "sellers" | "blog";

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sellerLeads, setSellerLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<IdxUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<Tab>("users");
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatPhone, setChatPhone] = useState<string | null>(null);
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
      setAuthed(true);
      setLoginError(false);
      try { localStorage.setItem("admin_auth", "1"); } catch {}
    } else {
      setLoginError(true);
    }
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

  useEffect(() => {
    try {
      if (localStorage.getItem("admin_auth") === "1") setAuthed(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadData();
  }, [authed, tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === "users") {
        const res = await fetch(`${IDX_API}/api/idx/admin/users`);
        if (res.ok) { setUsers((await res.json()).users || []); }
      } else if (tab === "leads") {
        const res = await fetch(`${IDX_API}/api/idx/admin/leads?limit=50`);
        if (res.ok) { setLeads((await res.json()).leads || []); }
      } else if (tab === "sessions") {
        const res = await fetch(`${IDX_API}/api/idx/admin/sessions?limit=50`);
        if (res.ok) { setSessions((await res.json()).sessions || []); }
      } else if (tab === "sellers") {
        const res = await fetch(`${IDX_API}/api/idx/admin/seller-leads?limit=50`);
        if (res.ok) { setSellerLeads((await res.json()).leads || []); }
      }
      // Always load stats
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
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
            placeholder="Password"
            className={`w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500 ${loginError ? "border-red-400" : ""}`}
            autoFocus
          />
          {loginError && <p className="text-sm text-red-500">Incorrect password</p>}
          <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700">
            Login
          </button>
        </form>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    new: "bg-green-100 text-green-800",
    contacted: "bg-blue-100 text-blue-800",
    qualified: "bg-purple-100 text-purple-800",
    closed: "bg-gray-100 text-gray-600",
  };

  const sourceLabels: Record<string, string> = {
    webchat_vale: "Webchat",
    whatsapp_vale: "WhatsApp",
    idx_website: "Website Form",
  };

  async function viewChat(phone: string) {
    setChatLoading(true);
    setChatPhone(phone);
    try {
      const res = await fetch(`${IDX_API}/api/idx/admin/chat-by-phone/${encodeURIComponent(phone)}`);
      if (res.ok) { setChatMessages((await res.json()).messages || []); }
    } catch { setChatMessages([]); }
    setChatLoading(false);
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Garden State AI — Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowChangePassword(true)}
            className="text-sm text-gray-500 hover:text-indigo-600">Change Password</button>
          <button onClick={() => { try { localStorage.removeItem("admin_auth"); } catch {} setAuthed(false); }}
            className="text-sm text-gray-500 hover:text-red-600">Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-2xl font-bold text-indigo-600">{users.length || stats.totalUsers || 0}</div>
            <div className="text-xs text-gray-500">Total Users</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-2xl font-bold text-green-600">{stats.newLeads || 0}</div>
            <div className="text-xs text-gray-500">New Leads</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.activeListings || 0}</div>
            <div className="text-xs text-gray-500">Active Listings</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-2xl font-bold text-amber-600">{sessions.filter(s => !s.expired).length || stats.activeSessions || 0}</div>
            <div className="text-xs text-gray-500">Active Sessions</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {(["users", "leads", "sessions", "sellers", "blog"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-white shadow text-navy" : "text-gray-500"}`}>
            {t === "users" ? `Users (${users.length})` :
             t === "leads" ? `Leads (${leads.length})` :
             t === "sessions" ? `Sessions (${sessions.length})` :
             t === "sellers" ? `Seller Leads (${sellerLeads.length})` :
             "Blog"}
          </button>
        ))}
      </div>

      {/* Refresh */}
      <div className="mb-4 flex justify-end">
        <button onClick={loadData} disabled={loading}
          className="rounded-lg border px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Users Table */}
      {tab === "users" && (
        <div className="space-y-3">
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
                    <div>interactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{u.previous_searches?.length || 0}</div>
                    <div>searches</div>
                  </div>
                  {u.favorite_towns?.length > 0 && (
                    <div className="hidden md:flex gap-1">
                      {u.favorite_towns.map(t => (
                        <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="text-right">
                    <div>Last: {fmtDate(u.last_interaction)}</div>
                    <div>First: {fmtDate(u.first_interaction)}</div>
                  </div>
                  <span className="text-lg">{expandedUser === u.id ? "−" : "+"}</span>
                </div>
              </div>

              {/* Expanded: search history */}
              {expandedUser === u.id && (
                <div className="border-t bg-gray-50 px-5 py-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-600">Search History</h3>
                  {u.previous_searches?.length > 0 ? (
                    <div className="space-y-2">
                      {u.previous_searches.slice().reverse().map((s, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg bg-white px-4 py-2 text-sm">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            s.type === "cma" ? "bg-purple-100 text-purple-700" :
                            s.type === "search" ? "bg-blue-100 text-blue-700" :
                            "bg-green-100 text-green-700"}`}>
                            {s.type.toUpperCase()}
                          </span>
                          <span className="flex-1 font-medium">{s.query}</span>
                          {s.result_summary && <span className="text-green-600 font-semibold">{s.result_summary}</span>}
                          <span className="text-xs text-gray-400">{fmtDate(s.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No searches recorded yet</p>
                  )}
                  {u.favorite_towns?.length > 0 && (
                    <div className="mt-3">
                      <h3 className="mb-1 text-sm font-semibold text-gray-600">Favorite Towns</h3>
                      <div className="flex gap-2">
                        {u.favorite_towns.map(t => (
                          <span key={t} className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); viewChat(u.phone); }}
                    className="mt-3 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs text-white hover:bg-indigo-700">
                    View WhatsApp Conversations
                  </button>
                </div>
              )}
            </div>
          ))}
          {users.length === 0 && (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow">No users yet — users are created when they interact via WhatsApp</div>
          )}
        </div>
      )}

      {/* Leads Table */}
      {tab === "leads" && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Interest</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{lead.full_name || "—"}</td>
                  <td className="px-4 py-3">
                    <div>{lead.phone || "—"}</div>
                    <div className="text-xs text-gray-400">{lead.email || ""}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-600">{lead.message || "—"}</td>
                  <td className="px-4 py-3 text-xs">{lead.lead_type}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                      {sourceLabels[lead.source] || lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lead.status] || "bg-gray-100"}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(lead.created_at)}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No leads yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Sessions Table */}
      {tab === "sessions" && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Last Message</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.phone_number}</td>
                  <td className="px-4 py-3 font-medium">{s.visitor_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.lead_captured ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.lead_captured ? "Captured" : "Not yet"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.expired ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                      {s.expired ? "Expired" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(s.last_message_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewChat(s.phone_number)}
                      className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-100">Chat</button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No sessions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg === "Password updated!" ? "text-green-600" : "text-red-500"}`}>{passwordMsg}</p>
            )}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700">Save</button>
              <button type="button" onClick={() => setShowChangePassword(false)}
                className="flex-1 rounded-lg border py-2 text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Viewer Modal */}
      {chatPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setChatPhone(null)}>
          <div className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div>
                <h3 className="font-bold text-navy">WhatsApp Conversation</h3>
                <p className="text-xs text-gray-400">{chatPhone}</p>
              </div>
              <button onClick={() => setChatPhone(null)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ minHeight: 200 }}>
              {chatLoading ? (
                <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>
              ) : chatMessages.length === 0 ? (
                <p className="py-8 text-center text-gray-400">No messages recorded yet. New conversations will appear here after the next WhatsApp chat.</p>
              ) : (
                chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                      m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={`mt-1 text-[10px] ${m.role === "user" ? "text-indigo-200" : "text-gray-400"}`}>
                        {fmtDate(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller Leads Table */}
      {tab === "sellers" && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sellerLeads.map((sl: any) => (
                <tr key={sl.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{sl.address || "—"}</div>
                    <div className="text-xs text-gray-400">{sl.city}, {sl.county}</div>
                  </td>
                  <td className="px-4 py-3">{sl.owner_name || "—"}</td>
                  <td className="px-4 py-3">
                    {sl.list_price ? <div className="font-medium">${sl.list_price.toLocaleString()}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {sl.bedrooms && <span>{sl.bedrooms}bd</span>}
                    {sl.bathrooms && <span>/{sl.bathrooms}ba</span>}
                    {sl.sqft && <span> | {sl.sqft}sqft</span>}
                  </td>
                  <td className="px-4 py-3 text-xs">{sl.original_agent || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[sl.status] || "bg-gray-100"}`}>
                      {sl.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(sl.created_at)}</td>
                </tr>
              ))}
              {sellerLeads.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No seller leads yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "blog" && (
        <AdminBlogTab password={password || "vale2026"} />
      )}
    </div>
  );
}
