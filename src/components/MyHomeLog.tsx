"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import MyHomeAddEntry, { type HomeEntry } from "./MyHomeAddEntry";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

// ── Types ───────────────────────────────────────────────────

interface MyHomeProfile {
  id: string;
  phone: string;
  name: string;
  address: string;
  city: string;
  estimated_value: number | null;
  assessed_value: number | null;
  mortgage_balance: number | null;
  created_at: string;
}

// HomeEntry type imported from MyHomeAddEntry

interface MaintenanceAlert {
  id: string;
  system: string;
  task: string;
  due_date: string;
  overdue_days: number;
}

type Category = "all" | "repair" | "upgrade" | "maintenance" | "inspection" | "permit" | "warranty" | "document";

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: "all", label: "All", icon: "", color: "bg-gray-100 text-gray-700" },
  { key: "repair", label: "Repairs", icon: "\u{1F527}", color: "bg-orange-100 text-orange-700" },
  { key: "upgrade", label: "Upgrades", icon: "\u2728", color: "bg-green-100 text-green-700" },
  { key: "maintenance", label: "Maintenance", icon: "\u2699\uFE0F", color: "bg-blue-100 text-blue-700" },
  { key: "inspection", label: "Inspections", icon: "\u{1F4CB}", color: "bg-purple-100 text-purple-700" },
  { key: "permit", label: "Permits", icon: "\u{1F4C4}", color: "bg-gray-200 text-gray-700" },
  { key: "warranty", label: "Warranty", icon: "\u{1F6E1}\uFE0F", color: "bg-teal-100 text-teal-700" },
  { key: "document", label: "Documents", icon: "\u{1F4C1}", color: "bg-slate-100 text-slate-700" },
];

const SYSTEMS = [
  "All", "Roof", "HVAC", "Kitchen", "Bathroom", "Plumbing", "Electrical",
  "Foundation", "Windows", "Flooring", "Exterior", "Landscaping", "Garage", "Other",
];

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getMonthKey(d: string): string {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [y, m] = key.split("-");
  const dt = new Date(Number(y), Number(m) - 1);
  return dt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getCategoryStyle(cat: string) {
  return CATEGORIES.find((c) => c.key === cat) || CATEGORIES[0];
}

// ── Component ───────────────────────────────────────────────

export default function MyHomeLog() {
  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState<MyHomeProfile | null>(null);
  const [entries, setEntries] = useState<HomeEntry[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [catFilter, setCatFilter] = useState<Category>("all");
  const [sysFilter, setSysFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Modal
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState<HomeEntry | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // ── Auth ──────────────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const cleaned = phone.replace(/\D/g, "");
      const res = await fetch(`${IDX_API}/api/idx/myhome/profile/${encodeURIComponent(cleaned)}`);
      if (!res.ok) {
        setError("No profile found. Claim your home first to get started.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProfile(data.profile || data);
      setAuthed(true);
      loadEntries(data.profile?.id || data.id);
      loadAlerts(data.profile?.id || data.id);
    } catch {
      setError("Could not connect. Please try again.");
    }
    setLoading(false);
  }

  const loadEntries = useCallback(async (profileId: string) => {
    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/entries/${profileId}?status=active`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || data || []);
      }
    } catch { /* silent */ }
  }, []);

  const loadAlerts = useCallback(async (profileId: string) => {
    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/maintenance/${profileId}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || data || []);
      }
    } catch { /* silent */ }
  }, []);

  async function deleteEntry(id: string) {
    if (!confirm("Delete this entry?")) return;
    try {
      await fetch(`${IDX_API}/api/idx/myhome/entries/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch { /* silent */ }
    setMenuOpen(null);
  }

  // ── Computed ──────────────────────────────────────────────

  const totalInvested = useMemo(() => entries.reduce((s, e) => s + (e.cost || 0), 0), [entries]);
  const totalValueAdded = useMemo(() => entries.reduce((s, e) => s + (e.value_impact || 0), 0), [entries]);

  const filtered = useMemo(() => {
    let result = [...entries];
    if (catFilter !== "all") result = result.filter((e) => e.category === catFilter);
    if (sysFilter !== "All") result = result.filter((e) => e.system === sysFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        (e.contractor_name || "").toLowerCase().includes(q) ||
        (e.notes || "").toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, catFilter, sysFilter, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, HomeEntry[]>();
    for (const e of filtered) {
      const key = getMonthKey(e.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const overdueAlerts = alerts.filter((a) => a.overdue_days > 0);

  // ── Auth state for multi-step login ────────────────────────
  const [loginStep, setLoginStep] = useState<"choose" | "phone" | "verify">("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");

  async function handleSocialLogin(provider: "google" | "apple") {
    setLoading(true);
    setError("");
    try {
      // OAuth via backend — redirects to Google/Apple, comes back with email
      const callbackUrl = `${window.location.origin}/my-home/log?auth=callback`;
      const res = await fetch(`${IDX_API}/api/idx/myhome/auth/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, callbackUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          // Redirect to OAuth provider
          window.location.href = data.url;
          return;
        }
        if (data.email) {
          setEmail(data.email);
          setLoginStep("phone");
        }
      } else {
        // Fallback: simple email input if OAuth not configured yet
        const inputEmail = prompt(`Enter your ${provider === "google" ? "Gmail" : "Apple ID"} email:`);
        if (!inputEmail) { setLoading(false); return; }
        setEmail(inputEmail);
        setLoginStep("phone");
      }
    } catch {
      // Fallback: simple email input
      const inputEmail = prompt(`Enter your ${provider === "google" ? "Gmail" : "Apple ID"} email:`);
      if (!inputEmail) { setLoading(false); return; }
      setEmail(inputEmail);
      setLoginStep("phone");
    }
    setLoading(false);
  }

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "callback") {
      const callbackEmail = params.get("email");
      const callbackPhone = params.get("phone");
      if (callbackEmail) {
        setEmail(callbackEmail);
        if (callbackPhone) {
          setPhone(callbackPhone);
          loginWithPhone(callbackPhone.replace(/\D/g, ""));
        } else {
          setLoginStep("phone");
        }
      }
      // Clean URL
      window.history.replaceState({}, "", "/my-home/log");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const cleaned = phone.replace(/\D/g, "");
      // Send OTP via backend
      const res = await fetch(`${IDX_API}/api/idx/myhome/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationId(data.verificationId || "pending");
        setLoginStep("verify");
      } else {
        // Fallback: skip OTP if endpoint doesn't exist yet, just login
        await loginWithPhone(cleaned);
      }
    } catch {
      // Fallback: direct login without OTP
      const cleaned = phone.replace(/\D/g, "");
      await loginWithPhone(cleaned);
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const cleaned = phone.replace(/\D/g, "");
    // Verify OTP then login
    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, code: otp, verificationId }),
      });
      if (res.ok) {
        await loginWithPhone(cleaned);
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch {
      // Fallback
      await loginWithPhone(cleaned);
    }
    setLoading(false);
  }

  async function loginWithPhone(cleaned: string) {
    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/profile/${encodeURIComponent(cleaned)}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || data);
        setAuthed(true);
        loadEntries(data.profile?.id || data.id);
        loadAlerts(data.profile?.id || data.id);
        // If we have email from social login, update profile
        if (email) {
          fetch(`${IDX_API}/api/idx/myhome/profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: cleaned, email }),
          }).catch(() => {});
        }
        // Capture as lead
        fetch(`${IDX_API}/api/idx/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: cleaned,
            email: email || undefined,
            lead_type: "info_request",
            source: "myhome_log",
            message: "Signed up for MyHome Log",
          }),
        }).catch(() => {});
      } else {
        // No profile — redirect to setup
        setError("");
        setAuthed(true);
        setProfile(null);
      }
    } catch {
      setError("Could not connect. Please try again.");
    }
  }

  // ── Login Screen ──────────────────────────────────────────

  if (!authed) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-white py-12">
        <div className="mx-auto max-w-md px-4 text-center">
          <h1 className="text-3xl font-bold text-navy">
            My<span className="text-gold">Home</span> Log
          </h1>
          <p className="mt-3 text-gray-500">
            Track every improvement, repair, and upgrade to your home.
            <br />
            <span className="text-xs text-gray-400">Free forever. Your data, your control.</span>
          </p>

          <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm text-left">
            {loginStep === "choose" && (
              <>
                {/* Social login buttons */}
                <button
                  onClick={() => handleSocialLogin("google")}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>

                <button
                  onClick={() => handleSocialLogin("apple")}
                  disabled={loading}
                  className="mt-3 w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-900 transition disabled:opacity-40"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Continue with Apple
                </button>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Phone login */}
                <button
                  onClick={() => setLoginStep("phone")}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-gold bg-gold/5 px-4 py-3 text-sm font-bold text-navy hover:bg-gold/10 transition"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                  Continue with Phone Number
                </button>

                <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed">
                  By signing in, you agree to our{" "}
                  <a href="/privacy" className="underline">Privacy Policy</a> &amp;{" "}
                  <a href="/terms" className="underline">Terms</a>.
                  We&apos;ll never share your info without permission.
                </p>
              </>
            )}

            {loginStep === "phone" && (
              <form onSubmit={handlePhoneSubmit}>
                {email && (
                  <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                    Signed in as <strong>{email}</strong>
                  </div>
                )}
                <label className="text-sm font-medium text-gray-700">
                  {email ? "Now add your phone number" : "Your phone number"}
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  {email ? "We'll link it to your account for WhatsApp updates" : "We'll send you a verification code"}
                </p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(201) 555-0123"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  autoFocus
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading || !phone.trim()}
                  className="mt-4 w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40 transition">
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
                <button type="button" onClick={() => { setLoginStep("choose"); setEmail(""); }}
                  className="mt-2 w-full text-sm text-gray-400 hover:text-gray-600">
                  Back
                </button>
              </form>
            )}

            {loginStep === "verify" && (
              <form onSubmit={handleVerifyOtp}>
                <label className="text-sm font-medium text-gray-700">Enter verification code</label>
                <p className="text-xs text-gray-400 mb-2">Sent to {phone}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  autoFocus
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading || otp.length < 4}
                  className="mt-4 w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40 transition">
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
                <button type="button" onClick={() => setLoginStep("phone")}
                  className="mt-2 w-full text-sm text-gray-400 hover:text-gray-600">
                  Resend code
                </button>
              </form>
            )}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Don&apos;t have a profile?{" "}
            <a href="/my-home" className="text-gold font-medium hover:underline">Claim your home first</a>
          </p>
        </div>
      </section>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            My<span className="text-gold">Home</span> Log
          </h1>
          <p className="text-sm text-gray-500">{profile?.address}, {profile?.city}, NJ</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditEntry(null); }}
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy hover:bg-yellow-400 transition">
          + Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Estimated Value" value={profile?.estimated_value ? fmt(profile.estimated_value) : "--"} sub="CMA estimate" />
        <SummaryCard label="Total Invested" value={fmt(totalInvested)} sub={`${entries.length} entries`} accent />
        <SummaryCard label="Value Added" value={fmt(totalValueAdded)} sub="Est. impact" positive />
        <SummaryCard label="Total Entries" value={String(entries.length)} sub={filtered.length !== entries.length ? `${filtered.length} shown` : "all time"} />
      </div>

      {/* Maintenance Alerts */}
      {overdueAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {overdueAlerts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
              <span className="text-amber-600 font-bold">!</span>
              <span className="text-amber-800">
                <strong>{a.task}</strong> ({a.system}) overdue by {a.overdue_days} day{a.overdue_days > 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCatFilter(c.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                catFilter === c.key ? "bg-navy text-white" : c.color + " hover:opacity-80"
              }`}>
              {c.icon ? `${c.icon} ` : ""}{c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={sysFilter} onChange={(e) => setSysFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gold focus:outline-none">
            {SYSTEMS.map((s) => <option key={s} value={s}>{s === "All" ? "All Systems" : s}</option>)}
          </select>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="flex-1 min-w-[180px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
        </div>
      </div>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
          <p className="text-gray-400">{entries.length === 0 ? "No entries yet. Add your first home improvement!" : "No entries match your filters."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([monthKey, items]) => (
            <div key={monthKey}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">{getMonthLabel(monthKey)}</h3>
              <div className="space-y-2">
                {items.map((entry) => {
                  const cat = getCategoryStyle(entry.category);
                  return (
                    <div key={entry.id} className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${cat.color}`}>
                          {cat.icon || "\u{1F3E0}"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-navy">{entry.title}</h4>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span>{fmtDate(entry.date)}</span>
                                {entry.contractor_name && (
                                  <>
                                    <span className="text-gray-300">|</span>
                                    <span>{entry.contractor_name}{entry.contractor_company ? ` - ${entry.contractor_company}` : ""}</span>
                                  </>
                                )}
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.color}`}>
                                  {entry.system}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              {entry.cost > 0 && <p className="font-bold text-navy">{fmt(entry.cost)}</p>}
                              {entry.value_impact != null && entry.value_impact > 0 && (
                                <p className="text-xs font-medium text-green-600">
                                  +{fmt(entry.value_impact)} value
                                  {entry.recovery_pct ? ` (${entry.recovery_pct}%)` : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Tags row */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {entry.warranty_expiry && (
                              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                                Warranty: {fmtDate(entry.warranty_expiry)}
                              </span>
                            )}
                            {entry.photo_count > 0 && (
                              <span className="text-[10px] text-gray-400">{entry.photo_count} photo{entry.photo_count > 1 ? "s" : ""}</span>
                            )}
                            {entry.attachment_count > 0 && (
                              <span className="text-[10px] text-gray-400">{entry.attachment_count} file{entry.attachment_count > 1 ? "s" : ""}</span>
                            )}
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="relative shrink-0">
                          <button onClick={() => setMenuOpen(menuOpen === entry.id ? null : entry.id)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {menuOpen === entry.id && (
                            <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border bg-white py-1 shadow-lg">
                              <button onClick={() => { setEditEntry(entry); setShowAdd(true); setMenuOpen(null); }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                Edit
                              </button>
                              <button onClick={() => deleteEntry(entry.id)}
                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Export PDF
        </button>
        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Export CSV
        </button>
        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Share Property Report
        </button>
        <a href="/list" className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/80 transition">
          List My Home
        </a>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <MyHomeAddEntry
          profileId={profile!.id}
          entry={editEntry}
          onClose={() => { setShowAdd(false); setEditEntry(null); }}
          onSaved={() => { setShowAdd(false); setEditEntry(null); loadEntries(profile!.id); }}
        />
      )}
    </div>
  );
}

// ── Summary Card ────────────────────────────────────────────

function SummaryCard({ label, value, sub, accent, positive }: {
  label: string; value: string; sub: string; accent?: boolean; positive?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ring-1 ${
      accent ? "bg-navy ring-navy" : positive ? "bg-green-50 ring-green-200" : "bg-white ring-gray-200"
    }`}>
      <p className={`text-[10px] font-medium uppercase tracking-wider ${accent ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </p>
      <p className={`mt-1 text-xl font-extrabold ${
        accent ? "text-white" : positive ? "text-green-700" : "text-navy"
      }`}>
        {value}
      </p>
      <p className={`mt-0.5 text-[10px] ${accent ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>
    </div>
  );
}

