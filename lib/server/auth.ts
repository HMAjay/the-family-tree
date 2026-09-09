import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { mutateDb, readStore, type UserRecord } from "./db";

const COOKIE = "tft_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-session-secret-the-family-tree-local"
);

export type SessionUser = { id: string; email: string; name: string };

function publicUser(user: UserRecord): SessionUser {
  return { id: user.id, email: user.email, name: user.name };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const id = typeof payload.sub === "string" ? payload.sub : "";
    if (!id) return null;
    const db = await readStore();
    const user = db.users.find((u) => u.id === id);
    return user ? publicUser(user) : null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return user;
}

export async function createUser(email: string, password: string, name: string) {
  const normalized = email.trim().toLowerCase();
  return mutateDb(async (db) => {
    if (db.users.some((u) => u.email === normalized)) {
      const err = new Error("An account with that email already exists.");
      (err as Error & { status: number }).status = 409;
      throw err;
    }
    const user: UserRecord = {
      id: nanoid(12),
      email: normalized,
      name: name.trim() || normalized.split("@")[0],
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return publicUser(user);
  });
}

export async function authenticate(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const db = await readStore();
  const user = db.users.find((u) => u.email === normalized);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    const err = new Error("Email or password is incorrect.");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return publicUser(user);
}
