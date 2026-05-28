import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth";
import { db } from "../db";
import { servers } from "../db/schema";
import { eq } from "drizzle-orm";
import { runCommand } from "../lib/ssh";

export const statsRouter = new Hono();
statsRouter.use("*", requireAuth);

statsRouter.get("/:serverId", async (c) => {
  const user = c.get("user") as { id: string };
  const [server] = await db
    .select()
    .from(servers)
    .where(eq(servers.id, c.req.param("serverId")));

  if (!server || server.ownerId !== user.id)
    return c.json({ error: "Not found" }, 404);

  const creds = {
    host: server.host,
    port: server.port,
    username: server.username,
    privateKey: server.privateKey,
  };

  const [cpuRes, memRes, diskRes, uptimeRes] = await Promise.all([
    runCommand(creds, "top -bn1 | grep 'Cpu(s)' | awk '{print $2}'"),
    runCommand(creds, "free -m | awk 'NR==2{printf \"%s %s\", $3, $2}'"),
    runCommand(creds, "df -h / | awk 'NR==2{printf \"%s %s\", $3, $2}'"),
    runCommand(creds, "uptime -p"),
  ]);

  const memParts = memRes.stdout.trim().split(" ");
  const diskParts = diskRes.stdout.trim().split(" ");

  return c.json({
    cpu: parseFloat(cpuRes.stdout.trim()) || 0,
    memory: {
      used: parseFloat(memParts[0]) || 0,
      total: parseFloat(memParts[1]) || 0,
    },
    disk: {
      used: diskParts[0] || "0G",
      total: diskParts[1] || "0G",
    },
    uptime: uptimeRes.stdout.trim(),
  });
});
