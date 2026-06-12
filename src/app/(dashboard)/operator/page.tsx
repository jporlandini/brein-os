import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OperatorDashboard from "@/components/dashboard/operator-dashboard";
import { getTasksForOperator } from "@/lib/notion/client";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { Quest } from "@/types";

type SessionUser = { id: string; role: string; notionOpId?: string; name?: string };

export default async function OperatorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as SessionUser;
  if (user.role !== "operador" && user.role !== "admin") redirect("/portal");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  let initialQuests: Quest[] = [];
  if (dbUser?.notionOperatorId) {
    initialQuests = await getTasksForOperator(dbUser.notionOperatorId);
  }

  return (
    <OperatorDashboard
      operatorName={session.user.name ?? "Operador"}
      initialQuests={initialQuests}
    />
  );
}
