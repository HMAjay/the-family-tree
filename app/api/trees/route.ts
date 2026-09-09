import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { mutateDb, readStore, type TreeRecord } from "@/lib/server/db";
import { jsonError, messageOf, statusOf } from "@/lib/server/http";
import { blankTreePayload, summarizeTree } from "@/lib/tree-payload";
import type { SavedTreePayload } from "@/lib/types";

function isPayload(value: unknown): value is SavedTreePayload {
  if (!value || typeof value !== "object") return false;
  const v = value as SavedTreePayload;
  return Array.isArray(v.people) && Array.isArray(v.relationships) && typeof v.familyName === "string";
}

function listItem(tree: TreeRecord) {
  const summary = summarizeTree(tree.snapshot);
  return {
    id: tree.id,
    name: tree.name || summary.name,
    peopleCount: summary.peopleCount,
    createdAt: tree.createdAt,
    updatedAt: tree.updatedAt,
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    const db = await readStore();
    const trees = db.trees.filter((t) => t.userId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return Response.json({ trees: trees.map(listItem) });
  } catch (err) {
    return jsonError(messageOf(err, "Sign in to see your trees."), statusOf(err, 401));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as { snapshot?: unknown; name?: string };
    const snapshot = isPayload(body.snapshot) ? body.snapshot : blankTreePayload(body.name);
    const now = new Date().toISOString();
    const tree = await mutateDb((db) => {
      const record: TreeRecord = {
        id: nanoid(12),
        userId: user.id,
        name: (body.name || snapshot.familyName || "Our Family").trim() || "Our Family",
        createdAt: now,
        updatedAt: now,
        snapshot: {
          ...snapshot,
          familyName: (body.name || snapshot.familyName || "Our Family").trim() || "Our Family",
          positions: snapshot.positions ?? {},
          layoutRevision: snapshot.layoutRevision ?? 5,
        },
      };
      db.trees.push(record);
      return record;
    });
    return Response.json({ tree: { ...listItem(tree), snapshot: tree.snapshot } });
  } catch (err) {
    return jsonError(messageOf(err, "Could not save the tree."), statusOf(err, 401));
  }
}
