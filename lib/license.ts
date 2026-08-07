import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db, now } from "./db";
import { row } from "./sql";

export const TICKET_TTL_MS = 15 * 60 * 1000; // ticket lifetime
export const NONCE_TTL_MS = 10 * 60 * 1000; // how long a challenge is valid

const TICKET_SECRET = process.env.TICKET_SECRET ?? process.env.CLIENT_SECRET ?? "change-me";

export interface TicketPayload {
  u: number; // user id
  w: string; // hwid
  p: string; // plan ("" | "legit" | "beta")
  e: number; // expiry (ms epoch)
  n: string; // nonce that the client presented in this request
}

export function signTicket(payload: TicketPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", TICKET_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyTicket(ticket: string): TicketPayload | null {
  const idx = ticket.lastIndexOf(".");
  if (idx <= 0) return null;
  const data = ticket.slice(0, idx);
  const sig = ticket.slice(idx + 1);
  const expected = createHmac("sha256", TICKET_SECRET).update(data).digest("base64url");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as TicketPayload;
    if (typeof payload.e !== "number" || payload.e < now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function issueNonce(userId: number): string {
  const nonce = randomBytes(24).toString("hex");
  db.prepare(
    "INSERT INTO client_nonces (user_id, nonce, issued_at) VALUES (?, ?, ?) " +
      "ON CONFLICT(user_id) DO UPDATE SET nonce = excluded.nonce, issued_at = excluded.issued_at"
  ).run(userId, nonce, now());
  return nonce;
}

// A nonce is valid only once: the client must present the last issued nonce,
// otherwise this is a replay and the session is rejected.
export function consumeNonce(userId: number, provided: string | undefined): boolean {
  const stored = row<{ nonce: string; issued_at: number }>(
    db.prepare("SELECT nonce, issued_at FROM client_nonces WHERE user_id = ?").get(userId)
  );
  if (!stored) {
    return true; // first handshake — nothing to compare yet
  }
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(stored.nonce);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  if (stored.issued_at + NONCE_TTL_MS < now()) return false;
  return true;
}

export function cleanupNonces(): void {
  db.prepare("DELETE FROM client_nonces WHERE issued_at < ?").run(now() - NONCE_TTL_MS);
}
