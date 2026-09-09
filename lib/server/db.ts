import { promises as fs } from "fs";
import path from "path";
import type { SavedTreePayload } from "@/lib/types";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type TreeSnapshotDoc = SavedTreePayload;

export type TreeRecord = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  snapshot: TreeSnapshotDoc;
};

type Database = {
  users: UserRecord[];
  trees: TreeRecord[];
};

const FILE = path.join(process.cwd(), "data", "store.json");
const emptyDb = (): Database => ({ users: [], trees: [] });

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readDb(): Promise<Database> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Database;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      trees: Array.isArray(parsed.trees) ? parsed.trees : [],
    };
  } catch {
    return emptyDb();
  }
}

async function writeDb(db: Database) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

export function mutateDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  return withLock(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
}

export function readStore(): Promise<Database> {
  return withLock(() => readDb());
}
