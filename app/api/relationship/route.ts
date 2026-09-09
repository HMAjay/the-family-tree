import { NextResponse } from "next/server";
import { buildIndex, findRelationship } from "@/lib/engine";
import type { FamilySnapshot } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { fromId?: string; toId?: string; snapshot?: FamilySnapshot };
  if (!body.snapshot || !body.fromId || !body.toId) {
    return NextResponse.json({ error: "fromId, toId, and snapshot are required." }, { status: 400 });
  }
  const index = buildIndex(body.snapshot.people, body.snapshot.relationships);
  return NextResponse.json(findRelationship(index, body.fromId, body.toId));
}
