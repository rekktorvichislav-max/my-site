import { getUserBySession } from "@/lib/auth";
import { hasPlan } from "@/lib/subscriptions";
import { cookies } from "next/headers";
import { Landing } from "@/components/Landing";

export default async function HomePage() {
  const token = (await cookies()).get("token")?.value;
  const user = getUserBySession(token);
  const hasDownload = user ? user.role === "admin" || hasPlan(user.id, "legit") : false;

  return (
    <Landing
      loggedIn={!!user}
      hasDownload={hasDownload}
      drun={!!user?.drun}
      username={user?.username ?? ""}
    />
  );
}
