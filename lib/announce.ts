import { row } from "@/lib/sql";
import { db, now } from "@/lib/db";

export interface Announcement {
  id: number;
  active: number;
  message: string | null;
  created_at: number;
}

export function getAnnouncement(): Announcement | null {
  return row<Announcement>(db.prepare("SELECT id, active, message, created_at FROM announcements ORDER BY id DESC LIMIT 1").get());
}

export function setAnnouncement(active: boolean, message?: string): Announcement {
  if (active) {
    db.prepare("INSERT INTO announcements (active, message, created_at) VALUES (1, ?, ?)").run(
      message ?? "Доступна новая версия клиента!",
      now()
    );
  } else {
    db.prepare("UPDATE announcements SET active = 0 WHERE id = (SELECT id FROM announcements ORDER BY id DESC LIMIT 1)").run();
  }
  const a = getAnnouncement();
  if (a) return a;
  // никогда не должно случиться, но подстрахуемся
  db.prepare("INSERT INTO announcements (active, message, created_at) VALUES (0, NULL, ?)").run(now());
  return getAnnouncement()!;
}
