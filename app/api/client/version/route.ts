import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

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

  return NextResponse.json({ version });
}
