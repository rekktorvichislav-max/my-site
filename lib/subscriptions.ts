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

export interface SubscriptionRow {
  id: number;
  user_id: number;
  plan: Plan;
  granted_by: number | null;
  granted_at: number;
  from_beta: number;
}

export function listSubscriptions(userId: number): Plan[] {
  return rows<{ plan: Plan }>(db.prepare("SELECT plan FROM subscriptions WHERE user_id = ?").all(userId))
    .map((r) => r.plan)
    .sort();
}

export function hasPlan(userId: number, plan: Plan): boolean {
  if (plan === "legit") {
    return listSubscriptions(userId).includes("beta") || listSubscriptions(userId).includes("legit");
  }
  return listSubscriptions(userId).includes("beta");
}

export function grantSubscription(
  userId: number,
  plan: Plan,
  grantedBy: number | null,
  fromBeta = false
): boolean {
  if (!PLANS.includes(plan)) return false;
  const result = db
    .prepare(
      "INSERT OR IGNORE INTO subscriptions (user_id, plan, granted_by, granted_at, from_beta) VALUES (?, ?, ?, ?, ?)"
    )
    .run(userId, plan, grantedBy, now(), fromBeta ? 1 : 0);
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
