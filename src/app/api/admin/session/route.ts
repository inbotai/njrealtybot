import { readCookie, verifySession, ADMIN_COOKIE } from "@/lib/server/admin-session";

export async function GET(req: Request) {
  return Response.json({ isAdmin: verifySession(readCookie(req, ADMIN_COOKIE)) });
}
