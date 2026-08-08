import { NextResponse } from "next/server";
import { getUserBySession, setUserUid, setUserRole, setUserDrun, deleteUser } from "@/lib/auth";
import { row } from "@/lib/sql";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const admin = getUserBySession(token);
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    username?: string;
    action?: "set-role" | "set-drun" | "set-uid" | "delete";
    role?: string;
    drun?: boolean;
    uid?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const action = body.action ?? "";
  if (!username || !action) {
    return NextResponse.json({ error: "username and action are required" }, { status: 400 });
  }

  const target = row<{ id: number; username: string; role: string }>(
    db.prepare("SELECT id, username, role FROM users WHERE username = ?").get(username)
  );
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  switch (action) {
    case "set-role": {
      const role = body.role?.trim() ?? "";
      if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 });
      setUserRole(target.id, role);
      return NextResponse.json({ ok: true, user: target.username, role });
    }
    case "set-drun": {
      setUserDrun(target.id, !!body.drun);
      return NextResponse.json({ ok: true, user: target.username, drun: !!body.drun });
    }
    case "set-uid": {
      const uid = body.uid?.trim() ?? "";
      if (!/^\d{5}$/.test(uid)) {
        return NextResponse.json({ error: "UID must be exactly 5 digits" }, { status: 400 });
      }
      setUserUid(target.id, uid);
      return NextResponse.json({ ok: true, user: target.username, uid });
    }
    case "delete": {
      if (target.id === admin.id) {
        return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
      }
      deleteUser(target.id);
      return NextResponse.json({ ok: true, deleted: target.username });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
