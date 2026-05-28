import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { getSession } from "../lib/auth";

export async function requireAuth(c: Context, next: Next) {
  const sessionId = getCookie(c, "qanal_session");
  if (!sessionId) return c.json({ error: "Unauthorized" }, 401);

  const session = await getSession(sessionId);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  c.set("user", session.user);
  c.set("sessionId", sessionId);
  await next();
}
