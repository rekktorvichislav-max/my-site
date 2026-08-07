import { NextResponse } from "next/server";
import { getUserBySession, setUserLang } from "@/lib/auth";
import type { Lang } from "@/lib/i18n";

export const runtime = "nodejs";

function getToken(req: Request): string | undefined {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
}

// Persist the chosen language for a logged-in user so the desktop client can
// follow the site (the browser cookie alone is invisible to the client).
export async function POST(req: Request) {
  const token = getToken(req);
  const user = token ? getUserBySession(token) : null;
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  let body: { lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const lang = body.lang === "en" || body.lang === "ru" ? (body.lang as Lang) : "ru";
  setUserLang(user.id, lang);
  return NextResponse.json({ ok: true, lang });
}

export async function GET(req: Request) {
  const token = getToken(req);
  const user = token ? getUserBySession(token) : null;
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, lang: user.lang ?? "ru" });
}
