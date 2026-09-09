import { NextResponse } from "next/server";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";
import { findUserByEmail } from "@/lib/user-db";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  const token = await signSession({ id: user.id, email: user.email, name: user.name });
  await setSessionCookie(token);
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    snapshot: user.snapshot,
  });
}
