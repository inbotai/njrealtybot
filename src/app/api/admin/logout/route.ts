import { sessionCookie } from "@/lib/server/admin-session";

export async function POST() {
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": sessionCookie("", 0) } },
  );
}
