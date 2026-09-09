import { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { mutateDb, readStore } from "@/lib/server/db";
import { jsonError, messageOf, statusOf } from "@/lib/server/http";
import { summarizeTree } from "@/lib/tree-payload";
import type { SavedTreePayload } from "@/lib/types";

function isPayload(value: unknown): value is SavedTreePayload {
  if (!value || typeof value !== "object") return false;
  const v = value as SavedTreePayload;
  return Array.isArray(v.people) && Array.isArray(v.relationships) && typeof v.familyName === "string";
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const db = await readStore();
    const tree = db.trees.find((t) => t.id === id && t.userId === user.id);
    if (!tree) return jsonError("Tree not found.", 404);
    return Response.json({ tree });
  } catch (err) {
    return jsonError(messageOf(err, "Sign in to open this tree."), statusOf(err, 401));
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = (await req.json()) as { snapshot?: unknown; name?: string };
    if (!isPayload(body.snapshot)) return jsonError("A tree snapshot is required.", 400);
    const snapshot = body.snapshot;
    const updated = await mutateDb((db) => {
      const tree = db.trees.find((t) => t.id === id && t.userId === user.id);
      if (!tree) return null;
      const name = (body.name || snapshot.familyName || tree.name).trim() || tree.name;
      tree.name = name;
      tree.snapshot = {
        ...snapshot,
        familyName: name,
        positions: snapshot.positions ?? {},
        layoutRevision: snapshot.layoutRevision ?? 5,
      };
      tree.updatedAt = new Date().toISOString();
      return tree;
    });
    if (!updated) return jsonError("Tree not found.", 404);
    const summary = summarizeTree(updated.snapshot);
    return Response.json({
      tree: {
        id: updated.id,
        name: updated.name,
        peopleCount: summary.peopleCount,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    return jsonError(messageOf(err, "Could not save the tree."), statusOf(err, 401));
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const ok = await mutateDb((db) => {
      const i = db.trees.findIndex((t) => t.id === id && t.userId === user.id);
      if (i < 0) return false;
      db.trees.splice(i, 1);
      return true;
    });
    if (!ok) return jsonError("Tree not found.", 404);
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(messageOf(err, "Could not delete the tree."), statusOf(err, 401));
  }
}
