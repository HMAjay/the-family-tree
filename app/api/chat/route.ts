import { NextResponse } from "next/server";
import { answerFamilyQuestion } from "@/lib/chat";
import type { FamilySnapshot } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { question?: string; snapshot?: FamilySnapshot };
  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }
  if (!body.snapshot) {
    return NextResponse.json({ error: "Family data is required." }, { status: 400 });
  }
  const reply = answerFamilyQuestion(body.snapshot, question);
  return NextResponse.json(reply);
}
