import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getAnnouncement } from "@/lib/announce";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_VERSION = "1.0.0";

export async function GET() {
  let version = process.env.CLIENT_VERSION ?? DEFAULT_VERSION;

  const clientPath = process.env.CLIENT_FILE_PATH ?? path.join(process.cwd(), "data", "client", "cotax-client.jar");
  try {
    if (fs.existsSync(clientPath)) {
      const stat = fs.statSync(clientPath);
      version = `${version}+${Math.floor(stat.mtimeMs / 1000)}`;
    }
  } catch {
    // ignore — fall back to the plain version
  }

  const a = getAnnouncement();
  return NextResponse.json({
    version,
    announce: a && a.active === 1
      ? { active: true, message: a.message ?? "Доступна новая версия клиента!", created_at: a.created_at }
      : { active: false },
  });
}
