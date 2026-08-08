import { NextResponse } from "next/server";
import { getUserBySession, recordDevice } from "@/lib/auth";
import { listSubscriptions, type Plan } from "@/lib/subscriptions";
import { TICKET_TTL_MS, consumeNonce, issueNonce, signTicket } from "@/lib/license";
import { getAnnouncement } from "@/lib/announce";

export const runtime = "nodejs";

function getTokenFromRequest(req: Request): string | undefined {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
}

function highestPlan(subs: Plan[]): string {
  if (subs.includes("beta")) return "beta";
  if (subs.includes("legit")) return "legit";
  return "";
}

export async function POST(req: Request) {
  let body: { hwid?: string; nonce?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hwid = body.hwid?.trim() ?? "";
  if (!hwid) {
    return NextResponse.json({ error: "Missing HWID" }, { status: 400 });
  }

  // The shared-secret fallback is gone: only a real session token is accepted.
  const token = getTokenFromRequest(req);
  const user = token ? getUserBySession(token) : null;
  if (!user) {
    return NextResponse.json({ ok: false, reason: "Invalid session" }, { status: 200 });
  }
  if (user.hwid !== hwid) {
    return NextResponse.json({ ok: false, reason: "HWID mismatch" }, { status: 200 });
  }

  // One-time challenge chain: a replay of a captured response fails here.
  if (!consumeNonce(user.id, body.nonce)) {
    return NextResponse.json({ ok: false, reason: "Replay detected" }, { status: 200 });
  }

  recordDevice(user.id, hwid, req.headers.get("x-forwarded-for") ?? undefined);

  const nonce = issueNonce(user.id);
  const subs = listSubscriptions(user.id);
  const ticket = signTicket({
    u: user.id,
    w: user.hwid ?? "",
    p: highestPlan(subs),
    e: Date.now() + TICKET_TTL_MS,
    n: body.nonce ?? "",
  });

  const a = getAnnouncement();
  const announce = a && a.active === 1
    ? { active: true, message: a.message ?? "Доступна новая версия клиента!", created_at: a.created_at }
    : { active: false };

  return NextResponse.json({
    ok: true,
    ticket,
    nonce,
    announce,
    user: { id: user.id, uid: user.uid, username: user.username, role: user.role, lang: user.lang ?? "ru", subscriptions: subs },
  });
}
