import { randomBytes, randomUUID } from "node:crypto";
import { db, now, generateUid, type UserRow } from "./db";
import { row, rows } from "./sql";
import bcrypt from "bcryptjs";

const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function createSession(userId: number, ip?: string, userAgent?: string): string {
  const token = generateSessionToken();
  const createdAt = now();
  const expiresAt = createdAt + SESSION_DAYS * 24 * 60 * 60 * 1000;
  db.prepare(
    "INSERT INTO sessions (id, user_id, created_at, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(token, userId, createdAt, expiresAt, ip ?? null, userAgent ?? null);
  return token;
}

export function getUserBySession(token: string | undefined): UserRow | null {
  if (!token) return null;
  const session = row<{ user_id: number }>(
    db.prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > ?").get(token, now())
  );
  if (!session) return null;
  return row<UserRow>(db.prepare("SELECT * FROM users WHERE id = ?").get(session.user_id));
}

export function getUserByUsername(username: string): UserRow | null {
  return row<UserRow>(db.prepare("SELECT * FROM users WHERE username = ?").get(username));
}

export function usernameExistsCI(username: string): boolean {
  return !!db.prepare("SELECT id FROM users WHERE lower(username) = lower(?)").get(username);
}

export function emailExists(email: string): boolean {
  return !!db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(email);
}

export function uidExists(uid: string, excludeUserId?: number): boolean {
  if (excludeUserId) {
    return !!db.prepare("SELECT id FROM users WHERE uid = ? AND id != ?").get(uid, excludeUserId);
  }
  return !!db.prepare("SELECT id FROM users WHERE uid = ?").get(uid);
}

export function getUserByEmail(email: string): UserRow | null {
  return row<UserRow>(db.prepare("SELECT * FROM users WHERE email = ?").get(email));
}

export function createUser(username: string, email: string, password: string): UserRow {
  const hash = hashPassword(password);
  const createdAt = now();
  let id = 0;
  for (let i = 0; i < 10; i++) {
    // INSERT OR IGNORE: if the random uid collides, changes = 0 and we retry.
    const result = db
      .prepare("INSERT OR IGNORE INTO users (username, email, password_hash, uid, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(username, email, hash, generateUid(), createdAt);
    if (Number(result.changes) > 0) {
      id = Number(result.lastInsertRowid);
      break;
    }
  }
  return row<UserRow>(db.prepare("SELECT * FROM users WHERE id = ?").get(id))!;
}

export function getUserByUid(uid: string): UserRow | null {
  if (!uid) return null;
  return row<UserRow>(db.prepare("SELECT * FROM users WHERE uid = ?").get(uid));
}

export function bindHwid(userId: number, hwid: string): void {
  db.prepare("UPDATE users SET hwid = ?, hwid_bound_at = ? WHERE id = ?").run(
    hwid,
    now(),
    userId
  );
}

export function updatePassword(userId: number, password: string): void {
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), userId);
}

export function setUserLang(userId: number, lang: string): void {
  const value = lang === "en" ? "en" : "ru";
  db.prepare("UPDATE users SET lang = ? WHERE id = ?").run(value, userId);
}

export function deleteSession(token: string): void {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(token);
}

export function destroyAllSessions(userId: number): void {
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export interface DeviceRow {
  id: number;
  user_id: number;
  hwid: string;
  first_seen_at: number;
  last_seen_at: number;
  ip: string | null;
}

export function recordDevice(userId: number, hwid: string, ip?: string): void {
  const existing = row<{ id: number }>(
    db.prepare("SELECT id FROM devices WHERE user_id = ? AND hwid = ?").get(userId, hwid)
  );
  if (existing) {
    db.prepare("UPDATE devices SET last_seen_at = ?, ip = ? WHERE id = ?").run(
      now(),
      ip ?? null,
      existing.id
    );
  } else {
    db.prepare(
      "INSERT INTO devices (user_id, hwid, first_seen_at, last_seen_at, ip) VALUES (?, ?, ?, ?, ?)"
    ).run(userId, hwid, now(), now(), ip ?? null);
  }
}

export function listDevices(userId: number): DeviceRow[] {
  return rows<DeviceRow>(
    db.prepare("SELECT * FROM devices WHERE user_id = ? ORDER BY last_seen_at DESC").all(userId)
  );
}

export function deleteUserDevices(userId: number): void {
  db.prepare("DELETE FROM devices WHERE user_id = ?").run(userId);
}

export function publicUser(user: UserRow) {
  return {
    id: user.id,
    uid: user.uid,
    username: user.username,
    email: user.email,
    role: user.role,
    drun: user.drun === 1,
    hwid: user.hwid,
    hwid_bound_at: user.hwid_bound_at,
    created_at: user.created_at,
    last_login: user.last_login,
  };
}

export function setUserUid(userId: number, uid: string): void {
  db.prepare("UPDATE users SET uid = ? WHERE id = ?").run(uid, userId);
}

export function setUserRole(userId: number, role: string): void {
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId);
}

export function setUserDrun(userId: number, drun: boolean): void {
  db.prepare("UPDATE users SET drun = ? WHERE id = ?").run(drun ? 1 : 0, userId);
}

export function deleteUser(userId: number): void {
  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
}

export function setLastLogin(userId: number): void {
  db.prepare("UPDATE users SET last_login = ? WHERE id = ?").run(now(), userId);
}

export function randomHwid(): string {
  return randomUUID().replace(/-/g, "").toUpperCase();
}
