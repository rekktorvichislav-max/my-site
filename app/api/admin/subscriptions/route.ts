import { NextResponse } from "next/server";
import { getUserBySession } from "@/lib/auth";
import { row } from "@/lib/sql";
import { db } from "@/lib/db";
import { PLANS, grantSubscription, revokeSubscription, isAdmin, type Plan } from "@/lib/subscriptions";

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

  let body: { username?: string; plan?: string; action?: "grant" | "revoke"; days?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const plan = body.plan as Plan;
  const action = body.action ?? "grant";
  const days = body.days === undefined || body.days === null ? null : Number(body.days);

  if (!username || !PLANS.includes(plan)) {
    return NextResponse.json({ error: "username and plan (legit|beta) are required" }, { status: 400 });
  }
  if (action !== "grant" && action !== "revoke") {
    return NextResponse.json({ error: "action must be grant or revoke" }, { status: 400 });
  }
  if (days !== null && (!Number.isFinite(days) || days <= 0)) {
    return NextResponse.json({ error: "days must be a positive number or omitted for a perpetual grant" }, { status: 400 });
  }

  const target = row<{ id: number; username: string; role: string }>(
    db.prepare("SELECT id, username, role FROM users WHERE username = ?").get(username)
  );
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "grant") {
    grantSubscription(target.id, plan, admin.id, false, days);
    return NextResponse.json({ ok: true, user: target.username, plan, action, days });
  }

  if (plan === "beta") {
    revokeSubscription(target.id, "beta");
  } else {
    revokeSubscription(target.id, "legit");
  }
  return NextResponse.json({ ok: true, user: target.username, plan, action });
}
