import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { FamilySnapshot } from "@/lib/types";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  snapshot: FamilySnapshot | null;
};

type StoreFile = { users: StoredUser[] };

function storePath() {
  if (process.env.VERCEL) return path.join("/tmp", "family-tree-store.json");
  return path.join(process.cwd(), "data", "store.json");
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(storePath(), "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { users: [] };
  }
}

async function writeStore(store: StoreFile) {
  const file = storePath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(store), "utf8");
}

export async function findUserByEmail(email: string) {
  const store = await readStore();
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string) {
  const store = await readStore();
  return store.users.find((u) => u.id === id) ?? null;
}

export async function createUser(user: StoredUser) {
  const store = await readStore();
  store.users.push(user);
  await writeStore(store);
  return user;
}

export async function saveUserSnapshot(userId: string, snapshot: FamilySnapshot) {
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;
  user.snapshot = snapshot;
  await writeStore(store);
  return user;
}
