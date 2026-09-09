import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { hashPassword, setSessionCookie, signSession } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/user-db";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string; name?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const name = body.name?.trim() || email.split("@")[0];
  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json(
      { error: "Use a valid email and a password of at least 8 characters." },
      { status: 400 }
    );
  }
  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }
  const user = await createUser({
    id: nanoid(12),
    email,
    name,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    snapshot: null,
  });
  const token = await signSession({ id: user.id, email: user.email, name: user.name });
  await setSessionCookie(token);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
}
