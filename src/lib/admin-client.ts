/** Call an allowlisted IDX admin/chat route through the server, which attaches the admin token. */
export async function adminProxy(path: string, method = "GET", body?: unknown): Promise<Response> {
  return fetch("/api/admin/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ path, method, body }),
  });
}
