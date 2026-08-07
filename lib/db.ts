import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { randomInt } from "node:crypto";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "cotax.db");

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    hwid TEXT,
    hwid_bound_at INTEGER,
    lang TEXT NOT NULL DEFAULT 'ru',
    created_at INTEGER NOT NULL,
    last_login INTEGER
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    ip TEXT,
    user_agent TEXT
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('legit', 'beta')),
    granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    granted_at INTEGER NOT NULL,
    from_beta INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, plan)
  );

  CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hwid TEXT NOT NULL,
    first_seen_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    ip TEXT,
    UNIQUE (user_id, hwid)
  );

  CREATE TABLE IF NOT EXISTS client_nonces (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nonce TEXT NOT NULL,
    issued_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saved_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    username TEXT NOT NULL,
    uuid TEXT,
    token_enc TEXT,
    updated_at INTEGER NOT NULL,
    UNIQUE (user_id, username)
  );
`);

export interface UserRow {
  id: number;
  uid: string | null;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  hwid: string | null;
  hwid_bound_at: number | null;
  lang: string;
  created_at: number;
  last_login: number | null;
}

export function now(): number {
  return Date.now();
}

export function generateUid(): string {
  // 1..99999 — "00000" is reserved for the owner/admin.
  return randomInt(1, 100000).toString().padStart(5, "0");
}

// Migration: add uid column, ensure every user has a 5-digit uid.
function migrateUid() {
  const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "uid")) {
    db.exec("ALTER TABLE users ADD COLUMN uid TEXT");
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid ON users(uid)");
  const users = db.prepare("SELECT id, uid FROM users").all() as { id: number; uid: string | null }[];
  const used = new Set<string>();
  for (const u of users) {
    let uid = u.uid && /^\d{5}$/.test(u.uid) ? u.uid : generateUid();
    while (used.has(uid)) {
      uid = generateUid();
    }
    used.add(uid);
    db.prepare("UPDATE users SET uid = ? WHERE id = ?").run(uid, u.id);
  }
}
migrateUid();

// Add from_beta column (legit granted via beta) for existing installs.
function migrateSubscriptions() {
  const cols = db.prepare("PRAGMA table_info(subscriptions)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "from_beta")) {
    db.exec("ALTER TABLE subscriptions ADD COLUMN from_beta INTEGER NOT NULL DEFAULT 0");
  }
}
migrateSubscriptions();

// Add lang column for site<->client language sync on existing installs.
function migrateLang() {
  const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "lang")) {
    db.exec("ALTER TABLE users ADD COLUMN lang TEXT NOT NULL DEFAULT 'ru'");
  }
}
migrateLang();

// Backfill devices from existing HWID bindings (idempotent).
function migrateDevices() {
  const users = db
    .prepare("SELECT id, hwid, hwid_bound_at FROM users WHERE hwid IS NOT NULL")
    .all() as { id: number; hwid: string; hwid_bound_at: number | null }[];
  for (const u of users) {
    const exists = db.prepare("SELECT id FROM devices WHERE user_id = ? AND hwid = ?").get(u.id, u.hwid);
    if (!exists) {
      const t = u.hwid_bound_at ?? now();
      db.prepare(
        "INSERT INTO devices (user_id, hwid, first_seen_at, last_seen_at, ip) VALUES (?, ?, ?, ?, NULL)"
      ).run(u.id, u.hwid, t, t);
    }
  }
}
migrateDevices();