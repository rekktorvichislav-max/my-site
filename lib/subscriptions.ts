import { db, now } from "./db";
import { row, rows } from "./sql";

export const PLANS = ["legit", "beta"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_LABEL: Record<Plan, string> = {
  legit: "Legit",
  beta: "Beta",
};

export const PLAN_PRICE: Record<Plan, number> = {
  legit: 0,
  beta: 0,
};

export const DAY_MS = 24 * 60 * 60 * 1000;

export interface SubscriptionRow {
  id: number;
  user_id: number;
  plan: Plan;
  granted_by: number | null;
  granted_at: number;
  from_beta: number;
  expires_at: number | null;
}

export interface PlanExpiry {
  plan: Plan;
  granted_at: number;
  from_beta: boolean;
  expires_at: number | null;
}

export function listSubscriptionRows(userId: number): PlanExpiry[] {
  return rows<{ plan: Plan; granted_at: number; from_beta: number; expires_at: number | null }>(
    db.prepare("SELECT plan, granted_at, from_beta, expires_at FROM subscriptions WHERE user_id = ?").all(userId)
  ).map((r) => ({ plan: r.plan, granted_at: r.granted_at, from_beta: r.from_beta === 1, expires_at: r.expires_at }));
}

export function listSubscriptions(userId: number): Plan[] {
  return listSubscriptionRows(userId)
    .filter((s) => s.expires_at === null || s.expires_at > now())
    .map((s) => s.plan)
    .sort();
}

export function hasPlan(userId: number, plan: Plan): boolean {
  return listSubscriptions(userId).includes(plan);
}

export function hasAnyPlan(userId: number): boolean {
  const subs = listSubscriptions(userId);
  return subs.includes("beta") || subs.includes("legit");
}

// durationDays === 0/undefined/null → perpetual (never expires).
export function grantSubscription(
  userId: number,
  plan: Plan,
  grantedBy: number | null,
  fromBeta = false,
  durationDays: number | null = null
): boolean {
  if (!PLANS.includes(plan)) return false;
  const expiresAt = durationDays && durationDays > 0 ? now() + Math.round(durationDays) * DAY_MS : null;
  const result = db
    .prepare(
      "INSERT INTO subscriptions (user_id, plan, granted_by, granted_at, from_beta, expires_at) VALUES (?, ?, ?, ?, ?, ?) " +
        "ON CONFLICT(user_id, plan) DO UPDATE SET granted_by = excluded.granted_by, granted_at = excluded.granted_at, " +
        "from_beta = excluded.from_beta, expires_at = excluded.expires_at"
    )
    .run(userId, plan, grantedBy, now(), fromBeta ? 1 : 0, expiresAt);
  return Number(result.changes) > 0;
}

// fromBeta === undefined → delete all rows of the plan;
// true/false → delete only rows granted via beta / granted standalone.
export function revokeSubscription(userId: number, plan: Plan, fromBeta?: boolean): boolean {
  const result =
    fromBeta === undefined
      ? db.prepare("DELETE FROM subscriptions WHERE user_id = ? AND plan = ?").run(userId, plan)
      : db
          .prepare("DELETE FROM subscriptions WHERE user_id = ? AND plan = ? AND from_beta = ?")
          .run(userId, plan, fromBeta ? 1 : 0);
  return Number(result.changes) > 0;
}

export function isAdmin(userId: number): boolean {
  const u = row<{ role: string }>(db.prepare("SELECT role FROM users WHERE id = ?").get(userId));
  return u !== null && u.role === "admin";
}
