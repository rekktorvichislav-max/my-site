import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getUserBySession } from "@/lib/auth";
import { hasAnyPlan } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getTokenFromRequest(req: Request): string | undefined {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
}

// The JVMTI agent jar that the loader attaches to the running Minecraft JVM.
export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  const user = getUserBySession(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const hwid = req.headers.get("x-cotax-hwid") ?? "";
  if (user.hwid && user.hwid !== hwid) {
    return NextResponse.json({ error: "HWID mismatch" }, { status: 403 });
  }

  if (!hasAnyPlan(user.id) && user.role !== "admin") {
    return NextResponse.json({ error: "noSubDownload" }, { status: 403 });
  }

  const agentPath = process.env.AGENT_FILE_PATH ?? path.join(process.cwd(), "data", "client", "cotax-agent.jar");
  if (!fs.existsSync(agentPath)) {
    return NextResponse.json({ error: "Payload not available" }, { status: 404 });
  }

  const stat = fs.statSync(agentPath);
  const body = fs.readFileSync(agentPath);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/java-archive",
      "Content-Length": String(stat.size),
      "Cache-Control": "no-store",
    },
  });
}
