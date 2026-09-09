import { NextResponse } from "next/server";
import { searchFamily } from "@/lib/engine";
import type { FamilySnapshot } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { query?: string; snapshot?: FamilySnapshot };
  if (!body.snapshot) {
    return NextResponse.json({ error: "Family data is required." }, { status: 400 });
  }
  return NextResponse.json(searchFamily(body.snapshot, body.query ?? ""));
}
