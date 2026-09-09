import { NextResponse } from "next/server";
import {
  buildIndex,
  getAncestors,
  getChildren,
  getParents,
  getPerson,
  getSiblings,
  getSpouse,
  getDescendants,
} from "@/lib/engine";
import type { FamilySnapshot } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    tool: string;
    personId?: string;
    snapshot: FamilySnapshot;
  };
  const index = buildIndex(body.snapshot.people, body.snapshot.relationships);
  switch (body.tool) {
    case "getPerson":
      return NextResponse.json(body.personId ? getPerson(index, body.personId) : null);
    case "getParents":
      return NextResponse.json(body.personId ? getParents(index, body.personId) : []);
    case "getChildren":
      return NextResponse.json(body.personId ? getChildren(index, body.personId) : []);
    case "getSiblings":
      return NextResponse.json(body.personId ? getSiblings(index, body.personId) : []);
    case "getSpouse":
      return NextResponse.json(body.personId ? getSpouse(index, body.personId) : []);
    case "getAncestors":
      return NextResponse.json(body.personId ? getAncestors(index, body.personId) : []);
    case "getDescendants":
      return NextResponse.json(body.personId ? getDescendants(index, body.personId) : []);
    default:
      return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
  }
}
