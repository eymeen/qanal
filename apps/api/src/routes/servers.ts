import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { db } from "../db";
import { servers } from "../db/schema";
import { eq } from "drizzle-orm";
import { testConnection, runCommand } from "../lib/ssh";
import { randomBytes } from "crypto";

export const serversRouter = new Hono();
serversRouter.use("*", requireAuth);

serversRouter.get("/", async (c) => {
  const user = c.get("user") as { id: string };
  const list = await db.select({
    id: servers.id,
    name: servers.name,
    host: servers.host,
    port: servers.port,
    username: servers.username,
    status: servers.status,
    createdAt: servers.createdAt,
  }).from(servers).where(eq(servers.ownerId, user.id));
  return c.json(list);
});

serversRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      host: z.string().min(1),
      port: z.number().int().min(1).max(65535).default(22),
      username: z.string().default("root"),
      privateKey: z.string().min(1),
    })
  ),
  async (c) => {
    const user = c.get("user") as { id: string };
    const body = c.req.valid("json");
    const id = randomBytes(8).toString("hex");

    const online = await testConnection({
      host: body.host,
      port: body.port,
      username: body.username,
      privateKey: body.privateKey,
    });

    await db.insert(servers).values({
      id,
      ...body,
      status: online ? "online" : "offline",
      ownerId: user.id,
    });

    return c.json({ id, status: online ? "online" : "offline" }, 201);
  }
);

serversRouter.get("/:id/ping", async (c) => {
  const user = c.get("user") as { id: string };
  const [server] = await db
    .select()
    .from(servers)
    .where(eq(servers.id, c.req.param("id")));

  if (!server || server.ownerId !== user.id)
    return c.json({ error: "Not found" }, 404);

  const online = await testConnection({
    host: server.host,
    port: server.port,
    username: server.username,
    privateKey: server.privateKey,
  });

  const status = online ? "online" : "offline";
  await db.update(servers).set({ status }).where(eq(servers.id, server.id));
  return c.json({ status });
});

serversRouter.delete("/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const [server] = await db
    .select()
    .from(servers)
    .where(eq(servers.id, c.req.param("id")));

  if (!server || server.ownerId !== user.id)
    return c.json({ error: "Not found" }, 404);

  await db.delete(servers).where(eq(servers.id, server.id));
  return c.json({ ok: true });
});
