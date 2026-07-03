"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import MyHomeAddEntry, { type HomeEntry } from "./MyHomeAddEntry";
import SmsConsent from "./SmsConsent";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

/** Build headers with owner token or legacy phone auth */
function phoneHeaders(p: string): Record<string, string> {
  // Prefer signed token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("myhome_token") : null;
  if (token) return { Authorization: `Bearer ${token}` };
  // Legacy fallback
  const cleaned = p.replace(/\D/g, "");
  return cleaned ? { "x-myhome-phone": cleaned } : {};
}

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-navy" />
          <p className="mt-3 text-sm text-gray-400">Loading MyHome Log...</p>
        </div>
      </section>
    );
  }

  return <MyHomeLogInner />;
}

function MyHomeLogInner() {
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

  // Setup profile form (used in both login screen and setup screen)
  const [setupName, setSetupName] = useState("");
  const [setupAddress, setSetupAddress] = useState("");
  const [setupCity, setSetupCity] = useState("");
  const [setupZip, setSetupZip] = useState("");
  const [setupSaving, setSetupSaving] = useState(false);

  // ── Auto-restore session ──────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("myhome_phone");
    if (saved && !authed) {
      setPhone(saved);
      loginWithPhone(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth ──────────────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const cleaned = phone.replace(/\D/g, "");
      const res = await fetch(`${IDX_API}/api/idx/myhome/profile/${encodeURIComponent(cleaned)}`, {
        headers: phoneHeaders(cleaned),
      });
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

  const loadEntries = useCallback(async (profileId: string, ownerPhone?: string) => {
    const p = ownerPhone || phone || localStorage.getItem("myhome_phone") || "";
    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/entries/${profileId}?status=active`, {
        headers: phoneHeaders(p),
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || data || []);
      }
    } catch { /* silent */ }
  }, [phone]);

  const loadAlerts = useCallback(async (profileId: string, ownerPhone?: string) => {
    const p = ownerPhone || phone || localStorage.getItem("myhome_phone") || "";
    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/maintenance/${profileId}`, {
        headers: phoneHeaders(p),
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || data || []);
      }
    } catch { /* silent */ }
  }, [phone]);

  async function deleteEntry(id: string) {
    if (!confirm("Delete this entry?")) return;
    try {
      const p = phone || localStorage.getItem("myhome_phone") || "";
      const res = await fetch(`${IDX_API}/api/idx/myhome/entries/${id}`, {
        method: "DELETE",
        headers: phoneHeaders(p),
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Failed to delete entry. Please try again.");
    }
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
  const [smsConsent, setSmsConsent] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  async function handleSocialLogin(provider: "google" | "apple") {
    setLoading(true);
    setError("");
    try {
      const { supabaseAuth } = await import("@/lib/supabase-auth");
      if (!supabaseAuth) {
        setError("Auth not configured. Use phone number instead.");
        setLoginStep("phone");
        setLoading(false);
        return;
      }
      const { error: authError } = await supabaseAuth.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/my-home/log?auth=callback`,
        },
      });
      if (authError) throw authError;
      // Browser will redirect to Google/Apple — when it comes back,
      // the useEffect callback handler will pick up the session
      return;
    } catch (err) {
      console.error("OAuth error:", err);
      setError("Login failed. Please try again.");
    }
    setLoading(false);
  }

  // Handle OAuth callback — check for Supabase session
  useEffect(() => {
    const url = new URL(window.location.href);
    const isCallback = url.searchParams.get("auth") === "callback";
    // Also detect hash-based tokens (implicit flow)
    const hasHash = window.location.hash.includes("access_token");
    if (!isCallback && !hasHash) return;

    (async () => {
      try {
        const { supabaseAuth } = await import("@/lib/supabase-auth");
        if (!supabaseAuth) return;

        // Exchange code if present (PKCE flow)
        const code = url.searchParams.get("code");
        if (code) {
          await supabaseAuth.auth.exchangeCodeForSession(code);
        }

        const { data: { session } } = await supabaseAuth.auth.getSession();
        if (session?.user?.email) {
          setEmail(session.user.email);
          const savedPhone = localStorage.getItem("myhome_phone");
          if (savedPhone) {
            setPhone(savedPhone);
            await loginWithPhone(savedPhone);
          } else {
            setLoginStep("phone");
          }
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
      }
      // Clean URL
      window.history.replaceState({}, "", "/my-home/log");
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const cleaned = phone.replace(/\D/g, "");
      const res = await fetch(`${IDX_API}/api/idx/myhome/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      if (res.ok) {
        setLoginStep("verify");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not send code. Try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const cleaned = phone.replace(/\D/g, "");
    try {
      const res = await fetch(`${IDX_API}/api/idx/myhome/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, code: otp }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // Store signed owner token for secure API access
        if (data.ownerToken) {
          localStorage.setItem("myhome_token", data.ownerToken);
        }
        await loginWithPhone(cleaned);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid code. Try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  async function loginWithPhone(cleaned: string) {
    try {
      localStorage.setItem("myhome_phone", cleaned);
      const res = await fetch(`${IDX_API}/api/idx/myhome/profile/${encodeURIComponent(cleaned)}`, {
        headers: phoneHeaders(cleaned),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || data);
        setAuthed(true);
        loadEntries(data.profile?.id || data.id, cleaned);
        loadAlerts(data.profile?.id || data.id, cleaned);
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
      <section className="min-h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2 items-start">

            {/* Left — what you get */}
            <div className="py-4">
              <h1 className="text-3xl font-bold text-navy leading-tight">
                Your Home's Complete{" "}
                <span className="text-gold">History & Intelligence</span>
              </h1>
              <p className="mt-3 text-gray-500">
                Every improvement you make adds value. Your MyHome Log proves it — to buyers, to appraisers, and to you.
              </p>

              {/* Hero benefit: Receipt Scanner */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 p-5 text-white">
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">📸</span>
                  <div>
                    <h3 className="text-lg font-bold">Just Snap a Photo</h3>
                    <p className="mt-1 text-sm text-indigo-100/90">
                      Text a photo of any receipt or invoice to Vale — she reads the amount, contractor, and category, calculates how much <span className="text-gold font-semibold">value it adds to your home</span>, and saves it to your log automatically. No typing.
                    </p>
                  </div>
                </div>

                {/* 3-step visual */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/10 p-3 text-center">
                    <p className="text-2xl">📱</p>
                    <p className="text-[10px] font-semibold mt-1 text-indigo-200">1. Send Photo</p>
                    <p className="text-[9px] text-indigo-300/80">WhatsApp or text</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3 text-center">
                    <p className="text-2xl">🤖</p>
                    <p className="text-[10px] font-semibold mt-1 text-indigo-200">2. Vale Analyzes</p>
                    <p className="text-[9px] text-indigo-300/80">Amount + value impact</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3 text-center">
                    <p className="text-2xl">✅</p>
                    <p className="text-[10px] font-semibold mt-1 text-indigo-200">3. Saved to Log</p>
                    <p className="text-[9px] text-indigo-300/80">With ROI calculated</p>
                  </div>
                </div>
              </div>

              {/* Other benefits */}
              <div className="mt-4 space-y-2">
                {[
                  { icon: "📊", title: "Value Tracking", desc: "Watch your home's worth grow as you invest" },
                  { icon: "🏛️", title: "Tax Analysis Saved", desc: "Every assessment check, documented with evidence" },
                  { icon: "🔨", title: "Renovation ROI", desc: "AI calculates how much each upgrade adds to your price" },
                  { icon: "📬", title: "Monthly Digest", desc: "Your value, nearby sales, and maintenance — one email" },
                  { icon: "📋", title: "Seller-Ready Package", desc: "When you sell, everything's ready — verified history buyers trust" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
                    <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-6 text-center">
                {[
                  { v: "Free", l: "No credit card" },
                  { v: "Private", l: "Your data stays yours" },
                  { v: "24/7", l: "Vale on WhatsApp" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-lg font-bold text-navy">{s.v}</p>
                    <p className="text-[10px] text-gray-400">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — login/register */}
            <div className="rounded-2xl border bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-navy text-center">
                Sign in to your My<span className="text-gold">Home</span> Log
              </h2>
              <p className="mt-1 text-sm text-gray-500 text-center">
                New here? Enter your phone to create your free log.
              </p>

              <div className="mt-6">
            {loginStep === "choose" && (
              <>
                {/* Phone-only login — name + phone required */}
                <form onSubmit={handlePhoneSubmit}>
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700">Your full name</label>
                    <input
                      type="text"
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      placeholder="John Smith"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700">Your phone number</label>
                    <p className="text-xs text-gray-400 mb-1">We'll send a verification code via SMS</p>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(201) 555-0123"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                      required
                    />
                  </div>
                  <SmsConsent checked={smsConsent} onChange={setSmsConsent} />
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={loading || !phone.trim() || !setupName.trim() || !smsConsent}
                    className="mt-4 w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40 transition">
                    {loading ? "Sending code..." : "Send Verification Code"}
                  </button>
                </form>

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
                  {email ? "We'll link it to your account for WhatsApp updates" : "We'll use this to access your home log"}
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
                  {loading ? "Sending code..." : "Send Verification Code"}
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
                <button type="submit" disabled={loading || otp.length < 6}
                  className="mt-4 w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40 transition">
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
                <button type="button" onClick={() => { setLoginStep("phone"); setOtp(""); setError(""); }}
                  className="mt-2 w-full text-sm text-gray-400 hover:text-gray-600">
                  Resend code
                </button>
              </form>
            )}

              </div>

              <p className="mt-4 text-xs text-gray-400 text-center">
                Already have an account? Just enter the same phone number.
              </p>
            </div>

          </div>
        </div>
      </section>
    );
  }

  // ── Profile setup state (declared at top of component) ────

  async function handleSetupProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!setupAddress.trim() || !setupCity.trim()) return;
    setSetupSaving(true);
    try {
      const cleaned = phone.replace(/\D/g, "");
      const res = await fetch(`${IDX_API}/api/idx/myhome/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleaned,
          full_name: setupName.trim() || undefined,
          email: email || undefined,
          address: setupAddress.trim(),
          city: setupCity.trim(),
          zip: setupZip.trim() || undefined,
          state: "NJ",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const p = data.profile || data;
        setProfile(p);
        loadEntries(p.id);
        loadAlerts(p.id);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Could not create profile (${res.status}). Try again.`);
      }
    } catch (err: any) {
      setError(err?.message || "Connection error. Try again.");
    }
    setSetupSaving(false);
  }

  // ── Profile Setup Screen ─────────────────────────────────

  if (authed && !profile) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-white py-12">
        <div className="mx-auto max-w-md px-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-navy">
              Set Up Your <span className="text-gold">Home</span> Profile
            </h1>
            <p className="mt-2 text-sm text-gray-500">Tell us about your property to get started</p>
          </div>
          <form onSubmit={handleSetupProfile} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Your Name</label>
              <input
                type="text" value={setupName} onChange={(e) => setSetupName(e.target.value)}
                placeholder="John Smith"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Property Address *</label>
              <input
                type="text" value={setupAddress} onChange={(e) => setSetupAddress(e.target.value)}
                placeholder="123 Main Street"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                required autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">City *</label>
                <input
                  type="text" value={setupCity} onChange={(e) => setSetupCity(e.target.value)}
                  placeholder="Hoboken"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ZIP</label>
                <input
                  type="text" value={setupZip} onChange={(e) => setSetupZip(e.target.value)}
                  placeholder="07030"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={setupSaving || !setupAddress.trim() || !setupCity.trim()}
              className="w-full rounded-lg bg-gold px-6 py-3 font-bold text-navy hover:bg-yellow-400 disabled:opacity-40 transition">
              {setupSaving ? "Creating..." : "Create My Home Profile"}
            </button>
          </form>
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
        <SummaryCard label="Estimated Value" value={profile?.estimated_value ? fmt(profile.estimated_value) : null} sub={profile?.estimated_value ? "AI estimate" : null} cta={!profile?.estimated_value ? { label: "Get Estimate", href: "/sell" } : undefined} />
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

      {/* Onboarding — empty state */}
      {entries.length === 0 && (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
          <h3 className="text-lg font-bold text-navy">Welcome to Your Home Log!</h3>
          <p className="mt-2 text-sm text-gray-500">Start tracking your home improvements to know your ROI and sell smarter.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {[
              { icon: "\u{1F50D}", title: "Home Inspection", desc: "Log your purchase inspection report" },
              { icon: "\u{1F527}", title: "First Repairs", desc: "Any fixes you made after moving in" },
              { icon: "\u{1F3A8}", title: "Paint & Cosmetics", desc: "Interior or exterior paint jobs" },
              { icon: "\u{1F512}", title: "Security Updates", desc: "New locks, alarm system, cameras" },
              { icon: "\u2744\uFE0F", title: "HVAC Service", desc: "Heating & cooling maintenance" },
              { icon: "\u{1F3E0}", title: "Major Upgrades", desc: "Kitchen, bathroom, roof, windows" },
            ].map((s) => (
              <button key={s.title} onClick={() => { setShowAdd(true); }}
                className="rounded-xl border bg-white p-4 text-left hover:border-indigo-300 hover:shadow-sm transition">
                <span className="text-xl">{s.icon}</span>
                <p className="mt-1 text-sm font-semibold text-navy">{s.title}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </button>
            ))}
          </div>

          <button onClick={() => { setShowAdd(true); setEditEntry(null); }}
            className="mt-6 rounded-xl bg-gold px-8 py-3 font-bold text-navy hover:bg-yellow-400 transition">
            + Add Your First Entry
          </button>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 && grouped.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
          <p className="text-gray-400">No entries match your filters.</p>
        </div>
      ) : grouped.length > 0 ? (
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
      ) : null}

      {/* Bottom Actions */}
      <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
        <button onClick={() => {
          if (!entries.length || !profile) return;
          const html = `<!DOCTYPE html><html><head><title>MyHome Log - ${profile.address}</title>
          <style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px}
          h1{color:#1e1b4b}table{width:100%;border-collapse:collapse;margin-top:20px}
          th{background:#1e1b4b;color:white;padding:8px;text-align:left;font-size:12px}
          td{border-bottom:1px solid #e5e7eb;padding:8px;font-size:12px}
          .summary{display:flex;gap:20px;margin:16px 0}
          .stat{background:#f3f4f6;padding:12px;border-radius:8px;flex:1;text-align:center}
          .stat-val{font-size:20px;font-weight:bold;color:#1e1b4b}
          .stat-label{font-size:10px;color:#6b7280}
          @media print{body{padding:0}}</style></head><body>
          <h1>MyHome Log</h1>
          <p>${profile.address}, ${profile.city || ""}, NJ</p>
          <div class="summary">
            <div class="stat"><div class="stat-val">$${totalInvested.toLocaleString()}</div><div class="stat-label">Total Invested</div></div>
            <div class="stat"><div class="stat-val">$${totalValueAdded.toLocaleString()}</div><div class="stat-label">Value Added</div></div>
            <div class="stat"><div class="stat-val">${entries.length}</div><div class="stat-label">Entries</div></div>
          </div>
          <table><thead><tr><th>Date</th><th>Title</th><th>Category</th><th>System</th><th>Cost</th><th>Value Impact</th><th>Contractor</th></tr></thead>
          <tbody>${entries.map(e => `<tr><td>${e.date}</td><td>${e.title}</td><td>${e.category}</td><td>${e.system || ""}</td><td>$${(e.cost || 0).toLocaleString()}</td><td>$${(e.value_impact || 0).toLocaleString()}</td><td>${e.contractor_name || ""}</td></tr>`).join("")}</tbody></table>
          <p style="margin-top:30px;font-size:10px;color:#9ca3af">Generated by gardenstate.ai on ${new Date().toLocaleDateString()}</p>
          </body></html>`;
          const w = window.open("", "_blank");
          if (w) { w.document.write(html); w.document.close(); w.print(); }
        }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Export PDF
        </button>
        <button onClick={() => {
          if (!entries.length) return;
          const headers = ["Date","Title","Category","System","Cost","Value Impact","Recovery %","Contractor","Company","Warranty Expiry","Notes"];
          const rows = entries.map(e => [
            e.date, e.title, e.category, e.system,
            e.cost || 0, e.value_impact || 0, e.recovery_pct || 0,
            e.contractor_name || "", e.contractor_company || "",
            e.warranty_expiry || "", (e.notes || "").replace(/"/g, '""')
          ]);
          const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `myhome-log-${new Date().toISOString().slice(0,10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
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
          ownerPhone={phone || localStorage.getItem("myhome_phone") || ""}
          entry={editEntry}
          onClose={() => { setShowAdd(false); setEditEntry(null); }}
          onSaved={() => { setShowAdd(false); setEditEntry(null); loadEntries(profile!.id); }}
        />
      )}
    </div>
  );
}

// ── Summary Card ────────────────────────────────────────────

function SummaryCard({ label, value, sub, accent, positive, cta }: {
  label: string; value: string | null; sub: string | null; accent?: boolean; positive?: boolean;
  cta?: { label: string; href: string };
}) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ring-1 ${
      accent ? "bg-navy ring-navy" : positive ? "bg-green-50 ring-green-200" : "bg-white ring-gray-200"
    }`}>
      <p className={`text-[10px] font-medium uppercase tracking-wider ${accent ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </p>
      {value ? (
        <p className={`mt-1 text-xl font-extrabold ${
          accent ? "text-white" : positive ? "text-green-700" : "text-navy"
        }`}>
          {value}
        </p>
      ) : cta ? (
        <a href={cta.href} className="mt-1 inline-block text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">
          {cta.label} &rarr;
        </a>
      ) : (
        <p className={`mt-1 text-xl font-extrabold ${accent ? "text-white" : "text-navy"}`}>--</p>
      )}
      {sub && <p className={`mt-0.5 text-[10px] ${accent ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}

