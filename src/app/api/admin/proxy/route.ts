import { ADMIN_COOKIE, readCookie, verifySession } from "@/lib/server/admin-session";

const IDX_API = "https://inbot-idx-api-production.up.railway.app";

const ALLOWED: Array<{ method: string; test: RegExp }> = [
  { method: "POST", test: /^\/api\/idx\/chat\/(start|message)$/ },
  { method: "GET", test: /^\/api\/idx\/admin\/(leads|users|stats)(\?.*)?$/ },
  { method: "DELETE", test: /^\/api\/idx\/admin\/leads\/[A-Za-z0-9-]+$/ },
  { method: "DELETE", test: /^\/api\/idx\/admin\/leads\/all$/ },
  { method: "DELETE", test: /^\/api\/idx\/admin\/users\/[A-Za-z0-9-]+$/ },
  { method: "GET", test: /^\/api\/idx\/admin\/chat-by-phone\/[^/?#]+$/ },
  { method: "GET", test: /^\/api\/idx\/admin\/blog\/articles$/ },
  { method: "POST", test: /^\/api\/idx\/admin\/blog\/generate$/ },
  { method: "POST", test: /^\/api\/idx\/admin\/blog\/articles\/[A-Za-z0-9-]+\/(publish|unpublish)$/ },
  { method: "PUT", test: /^\/api\/idx\/admin\/blog\/articles\/[A-Za-z0-9-]+$/ },
  { method: "DELETE", test: /^\/api\/idx\/admin\/blog\/articles\/[A-Za-z0-9-]+$/ },
];

function allowed(method: string, path: string): boolean {
  if (!path.startsWith("/api/idx/") || path.includes("..") || path.includes("\\") || path.includes("://")) {
    return false;
  }
  return ALLOWED.some((rule) => rule.method === method && rule.test.test(path));
}

export async function POST(req: Request) {
  if (!verifySession(readCookie(req, ADMIN_COOKIE))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) {
    return Response.json({ error: "Admin API token is not configured on the server." }, { status: 503 });
  }

  let path = "";
  let method = "GET";
  let body: unknown;
  try {
    const json = await req.json();
    path = typeof json?.path === "string" ? json.path : "";
    method = typeof json?.method === "string" ? json.method.toUpperCase() : "GET";
    body = json?.body;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!allowed(method, path)) {
    return Response.json({ error: "Path not allowed" }, { status: 403 });
  }

  const headers: Record<string, string> = { "X-Admin-Token": token };
  const init: RequestInit = { method, headers };
  if (body !== undefined && method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const upstream = await fetch(`${IDX_API}${path}`, init);
  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}
