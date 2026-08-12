import { NextResponse } from "next/server";
import { getUserBySession, recordDevice, setLastLogin } from "@/lib/auth";
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

// Resume a saved session ("remember me"): the loader stores the session token
// after a successful login and later exchanges it for a fresh state + nonce.
export async function POST(req: Request) {
  let body: { token?: string; hwid?: string; secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.secret !== CLIENT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hwid = body.hwid?.trim() ?? "";
  if (!HWID_RE.test(hwid)) {
    return NextResponse.json({ error: "Invalid HWID" }, { status: 400 });
  }

  const user = getUserBySession(body.token);
  if (!user) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
  if (user.hwid && user.hwid !== hwid) {
    return NextResponse.json({ error: "HWID mismatch: this account is bound to another PC" }, { status: 403 });
  }

  recordDevice(user.id, hwid, req.headers.get("x-forwarded-for") ?? undefined);
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
    token: body.token,
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
