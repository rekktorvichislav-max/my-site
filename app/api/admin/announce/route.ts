import { NextResponse } from "next/server";
import { getUserBySession } from "@/lib/auth";
import { getAnnouncement, setAnnouncement } from "@/lib/announce";

export const runtime = "nodejs";

// Announcements are controlled only by the manager account (Lake by default).
const ROLE_MANAGER = process.env.ROLE_MANAGER_USERNAME ?? "Lake";

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const user = getUserBySession(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.username !== ROLE_MANAGER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const a = getAnnouncement();
  return NextResponse.json({ ok: true, announce: a ?? null });
}

export async function POST(req: Request) {
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  const user = getUserBySession(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.username !== ROLE_MANAGER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { active?: boolean; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const a = setAnnouncement(!!body.active, body.message?.trim() || undefined);
  return NextResponse.json({ ok: true, announce: a });
}
