import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { findUserById, saveUserSnapshot } from "@/lib/user-db";
import type { FamilySnapshot } from "@/lib/types";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Please log in to save your tree." }, { status: 401 });
  const user = await findUserById(session.id);
  return NextResponse.json({ snapshot: user?.snapshot ?? null });
}

export async function PUT(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Please log in to save your tree." }, { status: 401 });
  const snapshot = (await req.json()) as FamilySnapshot;
  const saved = await saveUserSnapshot(session.id, snapshot);
  if (!saved) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
