import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getUserBySession } from "@/lib/auth";
import { hasAnyPlan } from "@/lib/subscriptions";
import { db, now } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFileName(raw: string | null, fallback: string): string {
  const name = (raw ?? "").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64).trim();
  if (!name) return fallback;
  const ext = fallback.includes(".") ? fallback.slice(fallback.lastIndexOf(".")) : "";
  return name.endsWith(ext) ? name : name + ext;
}

function getTokenFromRequest(req: Request): string | undefined {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
}

export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  const user = getUserBySession(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!hasAnyPlan(user.id) && user.role !== "admin") {
    return NextResponse.json({ error: "noSubDownload" }, { status: 403 });
  }

  const loaderPath = process.env.LOADER_FILE_PATH ?? path.join(process.cwd(), "data", "client", "cotax-loader.exe");
  if (!fs.existsSync(loaderPath)) {
    return NextResponse.json({ error: "Loader build not available" }, { status: 404 });
  }

  const fileName = safeFileName(new URL(req.url).searchParams.get("name"), "cotax-loader.exe");

  db.prepare("INSERT INTO downloads (user_id, file, created_at) VALUES (?, ?, ?)").run(
    user.id,
    fileName,
    now()
  );

  const stat = fs.statSync(loaderPath);
  const body = fs.readFileSync(loaderPath);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(stat.size),
    },
  });
}
