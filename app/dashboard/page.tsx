import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserBySession, publicUser, listDevices } from "@/lib/auth";
import { listSubscriptionRows } from "@/lib/subscriptions";
import { Dashboard } from "./Dashboard";

export const metadata = { title: "Dashboard — Axion Client" };

export default async function DashboardPage() {
  const token = (await cookies()).get("token")?.value;
  const user = getUserBySession(token);
  if (!user) {
    redirect("/login");
  }

  return (
    <Dashboard
      user={{ ...publicUser(user), subscriptions: listSubscriptionRows(user.id) }}
      devices={listDevices(user.id)}
    />
  );
}
