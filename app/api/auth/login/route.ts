import { NextRequest } from "next/server";
import { authenticate, createSession } from "@/lib/server/auth";
import { jsonError, messageOf, statusOf } from "@/lib/server/http";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    if (!email || !password) return jsonError("Email and password are required.", 400);
    const user = await authenticate(email, password);
    await createSession(user);
    return Response.json({ user });
  } catch (err) {
    return jsonError(messageOf(err, "Could not log in."), statusOf(err, 401));
  }
}
