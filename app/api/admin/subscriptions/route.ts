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

  let body: { username?: string; plan?: string; action?: "grant" | "revoke" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const plan = body.plan as Plan;
  const action = body.action ?? "grant";

  if (!username || !PLANS.includes(plan)) {
    return NextResponse.json({ error: "username and plan (legit|beta) are required" }, { status: 400 });
  }
  if (action !== "grant" && action !== "revoke") {
    return NextResponse.json({ error: "action must be grant or revoke" }, { status: 400 });
  }

  const target = row<{ id: number; username: string; role: string }>(
    db.prepare("SELECT id, username, role FROM users WHERE username = ?").get(username)
  );
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "grant") {
    grantSubscription(target.id, plan, admin.id);
    if (plan === "beta") {
      // Beta includes Legit.
      grantSubscription(target.id, "legit", admin.id, true);
    }
    return NextResponse.json({ ok: true, user: target.username, plan, action });
  }

  if (plan === "beta") {
    revokeSubscription(target.id, "beta");
    // Remove the Legit granted via Beta, keep a standalone Legit if the user bought it.
    revokeSubscription(target.id, "legit", true);
  } else {
    revokeSubscription(target.id, "legit", false);
  }
  return NextResponse.json({ ok: true, user: target.username, plan, action });
}
