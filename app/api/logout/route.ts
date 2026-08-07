import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
  if (token) {
    deleteSession(token);
  }
  return NextResponse.json({ ok: true });
}
