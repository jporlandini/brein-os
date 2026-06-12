import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { getTasksForOperator } from "@/lib/notion/client";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.notionOperatorId) {
    return NextResponse.json({ tasks: [] });
  }

  const tasks = await getTasksForOperator(user.notionOperatorId);
  return NextResponse.json({ tasks });
}
