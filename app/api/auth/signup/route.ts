import { NextRequest } from "next/server";
import { createSession, createUser } from "@/lib/server/auth";
import { jsonError, messageOf, statusOf } from "@/lib/server/http";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string; name?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const name = body.name?.trim() ?? "";
    if (!email || !email.includes("@")) return jsonError("Enter a valid email address.", 400);
    if (password.length < 8) return jsonError("Password must be at least 8 characters.", 400);
    const user = await createUser(email, password, name);
    await createSession(user);
    return Response.json({ user });
  } catch (err) {
    return jsonError(messageOf(err), statusOf(err, 400));
  }
}
