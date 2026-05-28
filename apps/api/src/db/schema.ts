import { sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["superadmin", "admin", "client"] })
    .notNull()
    .default("client"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const servers = sqliteTable("servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull().default(22),
  username: text("username").notNull().default("root"),
  privateKey: text("private_key").notNull(),
  status: text("status", { enum: ["online", "offline", "unknown"] })
    .notNull()
    .default("unknown"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const domains = sqliteTable("domains", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  serverId: text("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  sslEnabled: integer("ssl_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  docRoot: text("doc_root").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  domainId: text("domain_id")
    .notNull()
    .references(() => domains.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["static", "php", "node", "python"] })
    .notNull()
    .default("static"),
  status: text("status", { enum: ["running", "stopped", "deploying", "error"] })
    .notNull()
    .default("stopped"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
