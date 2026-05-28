import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { loginUser, createUser, deleteSession } from "../lib/auth";
import { requireAuth } from "../middleware/requireAuth";

export const authRouter = new Hono();

authRouter.post(
  "/login",
  zValidator(
    "json",
    z.object({ email: z.string().email(), password: z.string().min(8) })
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const result = await loginUser(email, password);
    if (!result) return c.json({ error: "Invalid credentials" }, 401);

    setCookie(c, "qanal_session", result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return c.json({ user: result.user });
  }
);

authRouter.post(
  "/register",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      name: z.string().min(2),
      password: z.string().min(8),
    })
  ),
  async (c) => {
    const { email, name, password } = c.req.valid("json");
    try {
      const user = await createUser(email, name, password, "superadmin");
      return c.json({ user }, 201);
    } catch {
      return c.json({ error: "Email already registered" }, 409);
    }
  }
);

authRouter.post("/logout", requireAuth, async (c) => {
  const sessionId = c.get("sessionId") as string;
  await deleteSession(sessionId);
  deleteCookie(c, "qanal_session");
  return c.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (c) => {
  return c.json({ user: c.get("user") });
});
