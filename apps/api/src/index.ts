import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRouter } from "./routes/auth";
import { serversRouter } from "./routes/servers";
import { domainsRouter } from "./routes/domains";
import { sitesRouter } from "./routes/sites";
import { statsRouter } from "./routes/stats";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:5173",
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ ok: true, version: "0.1.0" }));

app.route("/api/auth", authRouter);
app.route("/api/servers", serversRouter);
app.route("/api/domains", domainsRouter);
app.route("/api/sites", sitesRouter);
app.route("/api/stats", statsRouter);

const port = Number(process.env.PORT ?? 3001);
console.log(`Qanal API running on http://localhost:${port}`);

export default { port, fetch: app.fetch };
