import { createHash, createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "gsai_admin";
const MAX_AGE_SEC = 60 * 60 * 12;

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_TOKEN || "";
}

export function adminPasswords(): string[] {
  return (process.env.ADMIN_PASSWORDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function adminConfigured(): boolean {
  return adminPasswords().length > 0 && sessionSecret().length > 0;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function passwordMatches(input: string): boolean {
  const allowed = adminPasswords();
  if (!allowed.length || !input) return false;
  const hashed = digest(input);
  let ok = false;
  for (const pw of allowed) {
    const candidate = digest(pw);
    if (timingSafeEqual(hashed, candidate)) ok = true;
  }
  return ok;
}

export function signSession(now = Date.now()): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("Admin session secret is not configured");
  const exp = now + MAX_AGE_SEC * 1000;
  const payload = `v1.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined | null): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expStr, sig] = parts;
  if (version !== "v1") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = createHmac("sha256", secret).update(`${version}.${expStr}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function sessionCookie(value: string, maxAge = MAX_AGE_SEC): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}
