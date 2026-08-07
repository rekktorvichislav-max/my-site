import { getUserBySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { Landing } from "@/components/Landing";

export default async function HomePage() {
  const token = (await cookies()).get("token")?.value;
  const user = getUserBySession(token);

  return <Landing loggedIn={!!user} />;
}
