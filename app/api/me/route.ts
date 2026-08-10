import { NextResponse } from "next/server";
import { getUserBySession, publicUser } from "@/lib/auth";
import { listSubscriptionRows } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const user = getUserBySession(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user: {
      ...publicUser(user),
      subscriptions: listSubscriptionRows(user.id).map((s) => ({
        plan: s.plan,
        from_beta: s.from_beta,
        granted_at: s.granted_at,
        expires_at: s.expires_at,
      })),
    },
  });
}
