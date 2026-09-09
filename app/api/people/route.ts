import { NextResponse } from "next/server";
import { familyStats, inferMissingRelationships } from "@/lib/engine";
import type { FamilySnapshot } from "@/lib/types";

export async function POST(req: Request) {
  const snapshot = (await req.json()) as FamilySnapshot;
  return NextResponse.json({
    stats: familyStats(snapshot),
    inferred: inferMissingRelationships(snapshot.people, snapshot.relationships),
  });
}
