import { NextResponse } from "next/server";
import { getUserByUsername, getUserByEmail, verifyPassword, createSession, setLastLogin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { login?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const login = body.login?.trim() ?? "";
  const password = body.password ?? "";

  if (!login || !password) {
    return NextResponse.json({ error: "Login and password are required" }, { status: 400 });
  }

  const user = login.includes("@") ? getUserByEmail(login.toLowerCase()) : getUserByUsername(login);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createSession(user.id, req.headers.get("x-forwarded-for") ?? undefined, req.headers.get("user-agent") ?? undefined);
  setLastLogin(user.id);

  return NextResponse.json({
    ok: true,
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role, hwid: user.hwid },
  });
}
