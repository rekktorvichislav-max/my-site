import { NextResponse } from "next/server";
import { getUserByUsername, setUserUid, setUserRole, setUserDrun, deleteUser, uidExists } from "@/lib/auth";

export const runtime = "nodejs";

// Role management is restricted to a single manager account (Lake by default).
const ROLE_MANAGER = process.env.ROLE_MANAGER_USERNAME ?? "Lake";

// One-time admin bootstrap: lets you promote the first admin without an
// existing admin session. Protected by ADMIN_BOOTSTRAP_SECRET env var.
// Remove the env var after first use.
export async function POST(req: Request) {
  const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!bootstrapSecret) {
    return NextResponse.json({ error: "Bootstrap disabled" }, { status: 403 });
  }

  let body: {
    secret?: string;
    username?: string;
    action?: "setup" | "delete";
    role?: string;
    drun?: boolean;
    uid?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.secret !== bootstrapSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const username = body.username?.trim() ?? "";
  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }
  if (username !== ROLE_MANAGER) {
    return NextResponse.json({ error: "Forbidden: can only manage " + ROLE_MANAGER }, { status: 403 });
  }

  const user = getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    deleteUser(user.id);
    return NextResponse.json({ ok: true, deleted: username });
  }

  if (body.role) setUserRole(user.id, body.role);
  if (typeof body.drun === "boolean") setUserDrun(user.id, body.drun);
  if (body.uid) {
    if (!/^\d{5}$/.test(body.uid.trim())) {
      return NextResponse.json({ error: "UID must be exactly 5 digits" }, { status: 400 });
    }
    if (uidExists(body.uid.trim(), user.id)) {
      return NextResponse.json({ error: "UID already in use" }, { status: 409 });
    }
    setUserUid(user.id, body.uid.trim());
  }

  return NextResponse.json({ ok: true, user: username });
}
