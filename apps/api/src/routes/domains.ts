import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { db } from "../db";
import { domains, servers } from "../db/schema";
import { eq } from "drizzle-orm";
import { runCommand } from "../lib/ssh";
import { randomBytes } from "crypto";

export const domainsRouter = new Hono();
domainsRouter.use("*", requireAuth);

domainsRouter.get("/", async (c) => {
  const user = c.get("user") as { id: string };
  const list = await db
    .select({
      id: domains.id,
      name: domains.name,
      serverId: domains.serverId,
      sslEnabled: domains.sslEnabled,
      docRoot: domains.docRoot,
      createdAt: domains.createdAt,
    })
    .from(domains)
    .leftJoin(servers, eq(domains.serverId, servers.id))
    .where(eq(servers.ownerId, user.id));
  return c.json(list);
});

domainsRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(3),
      serverId: z.string(),
      docRoot: z.string().default("/var/www"),
    })
  ),
  async (c) => {
    const user = c.get("user") as { id: string };
    const body = c.req.valid("json");

    const [server] = await db
      .select()
      .from(servers)
      .where(eq(servers.id, body.serverId));

    if (!server || server.ownerId !== user.id)
      return c.json({ error: "Server not found" }, 404);

    const docRoot = `${body.docRoot}/${body.name}/public`;
    const id = randomBytes(8).toString("hex");

    const nginxConfig = `server {
    listen 80;
    server_name ${body.name} www.${body.name};

    root ${docRoot};
    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }

    location ~ /\\.ht {
        deny all;
    }
}`;

    const creds = {
      host: server.host,
      port: server.port,
      username: server.username,
      privateKey: server.privateKey,
    };

    await runCommand(creds, `mkdir -p ${docRoot}`);
    await runCommand(
      creds,
      `echo '${nginxConfig.replace(/'/g, "'\\''")}' > /etc/nginx/sites-available/${body.name}`
    );
    await runCommand(
      creds,
      `ln -sf /etc/nginx/sites-available/${body.name} /etc/nginx/sites-enabled/${body.name}`
    );
    await runCommand(creds, "nginx -t && systemctl reload nginx");

    await db.insert(domains).values({
      id,
      name: body.name,
      serverId: body.serverId,
      docRoot,
      sslEnabled: false,
    });

    return c.json({ id, name: body.name, docRoot }, 201);
  }
);

domainsRouter.post("/:id/ssl", async (c) => {
  const user = c.get("user") as { id: string };
  const [domain] = await db.select().from(domains).where(eq(domains.id, c.req.param("id")));
  if (!domain) return c.json({ error: "Not found" }, 404);

  const [server] = await db.select().from(servers).where(eq(servers.id, domain.serverId));
  if (!server || server.ownerId !== user.id) return c.json({ error: "Forbidden" }, 403);

  const creds = {
    host: server.host,
    port: server.port,
    username: server.username,
    privateKey: server.privateKey,
  };

  const result = await runCommand(
    creds,
    `certbot --nginx -d ${domain.name} -d www.${domain.name} --non-interactive --agree-tos --email admin@${domain.name} --redirect`
  );

  if (result.code !== 0) {
    return c.json({ error: "Certbot failed", stderr: result.stderr }, 500);
  }

  await db.update(domains).set({ sslEnabled: true }).where(eq(domains.id, domain.id));
  return c.json({ ok: true, ssl: true });
});

domainsRouter.delete("/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const [domain] = await db.select().from(domains).where(eq(domains.id, c.req.param("id")));
  if (!domain) return c.json({ error: "Not found" }, 404);

  const [server] = await db.select().from(servers).where(eq(servers.id, domain.serverId));
  if (!server || server.ownerId !== user.id) return c.json({ error: "Forbidden" }, 403);

  const creds = { host: server.host, port: server.port, username: server.username, privateKey: server.privateKey };

  await runCommand(creds, `rm -f /etc/nginx/sites-enabled/${domain.name}`);
  await runCommand(creds, `rm -f /etc/nginx/sites-available/${domain.name}`);
  await runCommand(creds, "systemctl reload nginx");
  await db.delete(domains).where(eq(domains.id, domain.id));
  return c.json({ ok: true });
});
