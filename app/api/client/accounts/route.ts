import { NextResponse } from "next/server";
import { getUserBySession } from "@/lib/auth";
import { listAccounts, upsertAccount, deleteAccount, replaceAccounts } from "@/lib/accounts";

export const runtime = "nodejs";

function getToken(req: Request): string | undefined {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
}

const USERNAME_RE = /^[A-Za-z0-9_]{1,64}$/;

export async function GET(req: Request) {
  const user = getToken(req) ? getUserBySession(getToken(req)!) : null;
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, accounts: listAccounts(user.id) });
}

export async function POST(req: Request) {
  const token = getToken(req);
  const user = token ? getUserBySession(token) : null;
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  let body: { username?: unknown; type?: unknown; uuid?: unknown; token?: unknown; accounts?: unknown; replace?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (Array.isArray(body.accounts)) {
    const accounts = body.accounts
      .filter(
        (a): a is { type: string; username: string; uuid?: string; token?: string } =>
          !!a && typeof a === "object" && typeof a.username === "string" && USERNAME_RE.test(a.username)
      )
      .map((a) => ({
        type: a.type === "premium" ? "premium" : "offline",
        username: a.username,
        uuid: typeof a.uuid === "string" ? a.uuid : "",
        token: typeof a.token === "string" ? a.token : "",
      }));
    if (body.replace === true) {
      replaceAccounts(user.id, accounts);
      return NextResponse.json({ ok: true, count: accounts.length });
    }
    for (const a of accounts) upsertAccount(user.id, a);
    return NextResponse.json({ ok: true, count: accounts.length });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json({ ok: false, error: "Invalid username" }, { status: 400 });
  }
  upsertAccount(user.id, {
    type: body.type === "premium" ? "premium" : "offline",
    username,
    uuid: typeof body.uuid === "string" ? body.uuid : "",
    token: typeof body.token === "string" ? body.token : "",
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const token = getToken(req);
  const user = token ? getUserBySession(token) : null;
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }
  const url = new URL(req.url);
  const username = (url.searchParams.get("username") ?? "").trim();
  if (!username) {
    return NextResponse.json({ ok: false, error: "Missing username" }, { status: 400 });
  }
  deleteAccount(user.id, username);
  return NextResponse.json({ ok: true });
}
