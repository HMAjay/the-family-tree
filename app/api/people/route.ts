import { NextResponse } from "next/server";
import { familyStats, inferMissingRelationships } from "@/lib/engine";
import { seedFamily } from "@/lib/seed";
import type { FamilySnapshot } from "@/lib/types";

export async function GET() {
  return NextResponse.json({
    sample: seedFamily,
    stats: familyStats(seedFamily),
    inferredCount: inferMissingRelationships(seedFamily.people, seedFamily.relationships).length,
  });
}

export async function POST(req: Request) {
  const snapshot = (await req.json()) as FamilySnapshot;
  return NextResponse.json({
    stats: familyStats(snapshot),
    inferred: inferMissingRelationships(snapshot.people, snapshot.relationships),
  });
}
