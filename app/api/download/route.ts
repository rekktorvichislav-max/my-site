import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getUserBySession } from "@/lib/auth";
import { hasPlan } from "@/lib/subscriptions";
import { db, now } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  if (!hasPlan(user.id, "legit")) {
    return NextResponse.json({ error: "noSubDownload" }, { status: 403 });
  }

  const clientPath = process.env.CLIENT_FILE_PATH ?? path.join(process.cwd(), "data", "client", "cotax-client.jar");
  if (!fs.existsSync(clientPath)) {
    return NextResponse.json({ error: "Client build not available" }, { status: 404 });
  }

  db.prepare("INSERT INTO downloads (user_id, file, created_at) VALUES (?, ?, ?)").run(
    user.id,
    path.basename(clientPath),
    now()
  );

  const stat = fs.statSync(clientPath);
  const body = fs.readFileSync(clientPath);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/java-archive",
      "Content-Disposition": `attachment; filename="${path.basename(clientPath)}"`,
      "Content-Length": String(stat.size),
    },
  });
}
