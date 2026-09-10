import { promises as fs, constants as fsConstants } from "fs";
import os from "os";
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

const emptyDb = (): Database => ({ users: [], trees: [] });

let queue: Promise<unknown> = Promise.resolve();
let resolvedFile: string | null = null;

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function isReadOnlyDeploy(): boolean {
  const cwd = process.cwd();
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      cwd === "/var/task" ||
      cwd.startsWith("/var/task/")
  );
}

function candidateDirs(): string[] {
  const dirs: string[] = [];
  if (process.env.DATA_DIR) dirs.push(process.env.DATA_DIR);
  const tmp = path.join(os.tmpdir(), "the-family-tree");
  if (!isReadOnlyDeploy()) dirs.push(path.join(process.cwd(), "data"));
  if (!dirs.includes(tmp)) dirs.push(tmp);
  return dirs;
}

async function dirIsWritable(dir: string): Promise<boolean> {
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.access(dir, fsConstants.W_OK);
    const probe = path.join(dir, `.write-probe-${process.pid}`);
    await fs.writeFile(probe, "ok");
    await fs.unlink(probe);
    return true;
  } catch {
    return false;
  }
}

async function storeFile(): Promise<string> {
  if (resolvedFile) return resolvedFile;
  for (const dir of candidateDirs()) {
    if (await dirIsWritable(dir)) {
      resolvedFile = path.join(dir, "store.json");
      return resolvedFile;
    }
  }
  throw new Error("Could not open a writable folder for account data.");
}

async function readDb(): Promise<Database> {
  try {
    const raw = await fs.readFile(await storeFile(), "utf8");
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
  const file = await storeFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
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
