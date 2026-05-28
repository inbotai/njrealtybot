"use client";

import { useEffect, useState } from "react";

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
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sellerLeads, setSellerLeads] = useState<any[]>([]);
  const [tab, setTab] = useState<"leads" | "sessions" | "sellers">("leads");
  const [loading, setLoading] = useState(false);

  // Simple password check — not production auth, just basic access control
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === "vale2026") {
      setAuthed(true);
      localStorage.setItem("admin_auth", "1");
    }
  }

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadData();
  }, [authed, tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === "leads") {
        const res = await fetch(`${IDX_API}/api/idx/admin/leads?limit=50`);
        if (res.ok) { setLeads((await res.json()).leads || []); }
      } else if (tab === "sessions") {
        const res = await fetch(`${IDX_API}/api/idx/admin/sessions?limit=50`);
        if (res.ok) { setSessions((await res.json()).sessions || []); }
      } else if (tab === "sellers") {
        const res = await fetch(`${IDX_API}/api/idx/admin/seller-leads?limit=50`);
        if (res.ok) { setSellerLeads((await res.json()).leads || []); }
      }
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
          />
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Garden State AI — Dashboard</h1>
        <button onClick={() => { localStorage.removeItem("admin_auth"); setAuthed(false); }}
          className="text-sm text-gray-500 hover:text-red-600">Logout</button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button onClick={() => setTab("leads")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === "leads" ? "bg-white shadow text-navy" : "text-gray-500"}`}>
          Leads ({leads.length})
        </button>
        <button onClick={() => setTab("sessions")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === "sessions" ? "bg-white shadow text-navy" : "text-gray-500"}`}>
          WhatsApp Sessions ({sessions.length})
        </button>
        <button onClick={() => setTab("sellers")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === "sellers" ? "bg-white shadow text-navy" : "text-gray-500"}`}>
          Seller Leads ({sellerLeads.length})
        </button>
      </div>

      {/* Refresh */}
      <div className="mb-4 flex justify-end">
        <button onClick={loadData} disabled={loading}
          className="rounded-lg border px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Leads Table */}
      {tab === "leads" && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Message</th>
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
                  <td className="px-4 py-3">{lead.lead_type}</td>
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
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(lead.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
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
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Last Message</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.phone_number}</td>
                  <td className="px-4 py-3 font-medium">{s.visitor_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.expired ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                      {s.expired ? "Expired" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(s.last_message_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No WhatsApp sessions yet</td></tr>
              )}
            </tbody>
          </table>
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
                <th className="px-4 py-3">Original Agent</th>
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
                    {sl.notes && (
                      <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">{sl.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>{sl.owner_name || "—"}</div>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      { expired_listing: "bg-red-50 text-red-700", stale_listing: "bg-orange-50 text-orange-700",
                        price_drop: "bg-yellow-50 text-yellow-700", overpriced: "bg-purple-50 text-purple-700",
                        neighbor_sold: "bg-amber-50 text-amber-700" }[sl.source] || "bg-gray-50 text-gray-700"
                    }`}>{{ expired_listing: "Expired", stale_listing: "Stale 90d+", price_drop: "Price Drop",
                        overpriced: "Overpriced", neighbor_sold: "Neighbor" }[sl.source as string] || sl.source}</span>
                  </td>
                  <td className="px-4 py-3">
                    {sl.list_price ? <div className="font-medium">${sl.list_price.toLocaleString()}</div> : null}
                    {sl.assessed_value && <div className="text-xs text-gray-400">Assessed: ${sl.assessed_value.toLocaleString()}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {sl.bedrooms && <span>{sl.bedrooms}bd</span>}
                    {sl.bathrooms && <span>/{sl.bathrooms}ba</span>}
                    {sl.sqft && <span> | {sl.sqft}sqft</span>}
                    {sl.year_built && <span> | {sl.year_built}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{sl.original_agent || "—"}</div>
                    <div className="text-xs text-gray-400">{sl.original_office || ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      sl.status === "new" ? "bg-green-100 text-green-800" :
                      sl.status === "contacted" ? "bg-blue-100 text-blue-800" :
                      sl.status === "converted" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-600"}`}>
                      {sl.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(sl.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
              {sellerLeads.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No seller leads yet — expired listings are scanned every 4 hours</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
