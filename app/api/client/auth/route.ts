import { NextResponse } from "next/server";
import { getUserByUsername, getUserByEmail, verifyPassword, createSession, setLastLogin, bindHwid, recordDevice } from "@/lib/auth";
import { listSubscriptions, type Plan } from "@/lib/subscriptions";
import { TICKET_TTL_MS, issueNonce, signTicket } from "@/lib/license";

export const runtime = "nodejs";

const CLIENT_SECRET = process.env.CLIENT_SECRET ?? "change-me";
const HWID_RE = /^[A-Za-z0-9\-_:]{8,64}$/;

function highestPlan(subs: Plan[]): string {
  if (subs.includes("beta")) return "beta";
  if (subs.includes("legit")) return "legit";
  return "";
}

export async function POST(req: Request) {
  let body: { username?: string; password?: string; hwid?: string; secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.secret !== CLIENT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const login = body.username?.trim() ?? "";
  const password = body.password ?? "";
  const hwid = body.hwid?.trim() ?? "";

  if (!login || !password) {
    return NextResponse.json({ error: "Login and password are required" }, { status: 400 });
  }
  if (!HWID_RE.test(hwid)) {
    return NextResponse.json({ error: "Invalid HWID" }, { status: 400 });
  }

  const user = login.includes("@") ? getUserByEmail(login.toLowerCase()) : getUserByUsername(login);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // One HWID (PC) may be shared by several accounts; each account is still
  // locked to the first HWID it logged in from (see mismatch check below).
  if (user.hwid && user.hwid !== hwid) {
    return NextResponse.json({ error: "HWID mismatch: this account is bound to another PC" }, { status: 403 });
  }
  if (!user.hwid) {
    bindHwid(user.id, hwid);
  }
  recordDevice(user.id, hwid, req.headers.get("x-forwarded-for") ?? undefined);
  const token = createSession(user.id, req.headers.get("x-forwarded-for") ?? undefined, req.headers.get("user-agent") ?? undefined);
  setLastLogin(user.id);

  const nonce = issueNonce(user.id);
  const subs = listSubscriptions(user.id);
  const ticket = signTicket({
    u: user.id,
    w: hwid,
    p: highestPlan(subs),
    e: Date.now() + TICKET_TTL_MS,
    n: "",
  });

  return NextResponse.json({
    ok: true,
    token,
    ticket,
    nonce,
    user: {
      id: user.id,
      uid: user.uid,
      username: user.username,
      email: user.email,
      role: user.role,
      hwid,
      lang: user.lang ?? "ru",
      subscriptions: subs,
    },
  });
}
