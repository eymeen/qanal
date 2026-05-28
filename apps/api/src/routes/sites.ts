import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { db } from "../db";
import { sites, domains, servers } from "../db/schema";
import { eq } from "drizzle-orm";
import { runCommand } from "../lib/ssh";
import { randomBytes } from "crypto";

export const sitesRouter = new Hono();
sitesRouter.use("*", requireAuth);

sitesRouter.get("/", async (c) => {
  const user = c.get("user") as { id: string };
  const list = await db
    .select({ id: sites.id, name: sites.name, type: sites.type, status: sites.status, domainId: sites.domainId, createdAt: sites.createdAt })
    .from(sites)
    .leftJoin(domains, eq(sites.domainId, domains.id))
    .leftJoin(servers, eq(domains.serverId, servers.id))
    .where(eq(servers.ownerId, user.id));
  return c.json(list);
});

sitesRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      domainId: z.string(),
      type: z.enum(["static", "php", "node", "python"]).default("static"),
    })
  ),
  async (c) => {
    const user = c.get("user") as { id: string };
    const body = c.req.valid("json");

    const [domain] = await db.select().from(domains).where(eq(domains.id, body.domainId));
    if (!domain) return c.json({ error: "Domain not found" }, 404);

    const [server] = await db.select().from(servers).where(eq(servers.id, domain.serverId));
    if (!server || server.ownerId !== user.id) return c.json({ error: "Forbidden" }, 403);

    const creds = { host: server.host, port: server.port, username: server.username, privateKey: server.privateKey };
    const id = randomBytes(8).toString("hex");

    // Place a starter index file
    if (body.type === "static") {
      await runCommand(creds, `echo '<!DOCTYPE html><html><head><title>${body.name}</title></head><body><h1>Welcome to ${body.name}</h1><p>Deployed via Qanal.</p></body></html>' > ${domain.docRoot}/index.html`);
    } else if (body.type === "php") {
      await runCommand(creds, `echo '<?php phpinfo(); ?>' > ${domain.docRoot}/index.php`);
    }

    await db.insert(sites).values({ id, name: body.name, domainId: body.domainId, type: body.type, status: "running" });
    return c.json({ id, name: body.name, type: body.type, status: "running" }, 201);
  }
);

sitesRouter.delete("/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const [site] = await db.select().from(sites).where(eq(sites.id, c.req.param("id")));
  if (!site) return c.json({ error: "Not found" }, 404);

  const [domain] = await db.select().from(domains).where(eq(domains.id, site.domainId));
  const [server] = await db.select().from(servers).where(eq(servers.id, domain.serverId));
  if (!server || server.ownerId !== user.id) return c.json({ error: "Forbidden" }, 403);

  await db.delete(sites).where(eq(sites.id, site.id));
  return c.json({ ok: true });
});
