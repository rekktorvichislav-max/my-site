import { NextResponse } from "next/server";
import { getUserBySession, publicUser } from "@/lib/auth";
import { listSubscriptions } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const user = getUserBySession(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user: { ...publicUser(user), subscriptions: listSubscriptions(user.id) },
  });
}
