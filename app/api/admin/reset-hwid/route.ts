import { NextResponse } from "next/server";
import { getUserBySession, deleteUserDevices } from "@/lib/auth";
import { db } from "@/lib/db";
import { row } from "@/lib/sql";

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

  let body: { username?: string; uid?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const uid = body.uid?.trim() ?? "";
  if (!username || !uid) {
    return NextResponse.json({ error: "username and uid are required" }, { status: 400 });
  }

  const target = row<{ id: number; uid: string; username: string }>(
    db.prepare("SELECT id, uid, username FROM users WHERE username = ?").get(username)
  );
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.uid !== uid) {
    return NextResponse.json({ error: "UID mismatch: user and UID do not match" }, { status: 403 });
  }

  db.prepare("UPDATE users SET hwid = NULL, hwid_bound_at = NULL WHERE id = ?").run(target.id);
  deleteUserDevices(target.id);
  return NextResponse.json({ ok: true, user: target.username });
}
