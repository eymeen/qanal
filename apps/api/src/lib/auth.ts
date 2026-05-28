import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuf = Buffer.from(hash, "hex");
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuf, derived);
}

export async function createUser(
  email: string,
  name: string,
  password: string,
  role: "superadmin" | "admin" | "client" = "client"
) {
  const id = generateId();
  const passwordHash = hashPassword(password);
  await db.insert(users).values({ id, email, name, passwordHash, role });
  return { id, email, name, role };
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) return null;

  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt,
  });

  return { sessionId, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function getSession(sessionId: string) {
  const [row] = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .leftJoin(users, eq(sessions.userId, users.id));

  if (!row?.session || row.session.expiresAt < new Date()) return null;
  return row;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
