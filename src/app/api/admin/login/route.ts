import { adminConfigured, passwordMatches, sessionCookie, signSession } from "@/lib/server/admin-session";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return Response.json(
      { ok: false, error: "Admin login is not configured on the server." },
      { status: 503 },
    );
  }
  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    password = "";
  }
  if (!passwordMatches(password)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": sessionCookie(signSession()) } },
  );
}
