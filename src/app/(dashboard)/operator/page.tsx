import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OperatorDashboard from "@/components/dashboard/operator-dashboard";
import { getTasksForOperator } from "@/lib/notion/client";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function OperatorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;
  if (userRole !== "operador" && userRole !== "admin") redirect("/portal");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, (session.user as any).id))
    .limit(1);

  let initialQuests = [];
  if (user?.notionOperatorId) {
    initialQuests = await getTasksForOperator(user.notionOperatorId);
  }

  return (
    <OperatorDashboard
      operatorName={session.user.name ?? "Operador"}
      initialQuests={initialQuests}
    />
  );
}
