import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { db } from "./db";

// Encrypt account access tokens at rest with a server key so a DB leak does not
// expose tokens in plaintext.
const KEY = createHash("sha256")
  .update(process.env.ACCOUNT_ENC_KEY || process.env.CLIENT_SECRET || "cotax-accounts-fallback")
  .digest();

export interface SavedAccount {
  type: string;
  username: string;
  uuid: string;
  token: string;
}

export function listAccounts(userId: number): SavedAccount[] {
  const rows = db
    .prepare("SELECT type, username, uuid, token_enc FROM saved_accounts WHERE user_id = ? ORDER BY username")
    .all(userId) as { type: string; username: string; uuid: string; token_enc: string | null }[];
  return rows.map((r) => ({ type: r.type, username: r.username, uuid: r.uuid ?? "", token: decrypt(r.token_enc) }));
}

export function upsertAccount(userId: number, account: SavedAccount): void {
  db.prepare(
    `INSERT INTO saved_accounts (user_id, type, username, uuid, token_enc, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, username) DO UPDATE SET
       type = excluded.type,
       uuid = excluded.uuid,
       token_enc = excluded.token_enc,
       updated_at = excluded.updated_at`
  ).run(userId, account.type, account.username, account.uuid, encrypt(account.token), Date.now());
}

export function deleteAccount(userId: number, username: string): void {
  db.prepare("DELETE FROM saved_accounts WHERE user_id = ? AND username = ?").run(userId, username);
}

export function replaceAccounts(userId: number, accounts: SavedAccount[]): void {
  db.prepare("DELETE FROM saved_accounts WHERE user_id = ?").run(userId);
  const insert = db.prepare(
    "INSERT INTO saved_accounts (user_id, type, username, uuid, token_enc, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const now = Date.now();
  for (const a of accounts) {
    insert.run(userId, a.type, a.username, a.uuid, encrypt(a.token), now);
  }
}

function encrypt(plain: string): string | null {
  if (!plain) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

function decrypt(payload: string | null): string {
  if (!payload) return "";
  try {
    const [ivB64, tagB64, dataB64] = payload.split(".");
    const decipher = createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
