import { NextResponse } from "next/server";
import { createUser, getUserByUsername, getUserByEmail, createSession, setLastLogin } from "@/lib/auth";

export const runtime = "nodejs";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(req: Request) {
  let body: { username?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ error: "Username must be 3-20 chars (letters, digits, _)" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 chars" }, { status: 400 });
  }

  if (getUserByUsername(username)) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }
  if (getUserByEmail(email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = createUser(username, email, password);
  const token = createSession(user.id, req.headers.get("x-forwarded-for") ?? undefined, req.headers.get("user-agent") ?? undefined);
  setLastLogin(user.id);

  return NextResponse.json(
    { ok: true, token, user: { id: user.id, uid: user.uid, username: user.username, email: user.email, role: user.role } },
    { status: 201 }
  );
}
