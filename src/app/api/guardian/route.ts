import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runGuardian } from "@/lib/agent/guardian";
import { db, users, auditLog } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { input } = await req.json();
  if (!input || typeof input !== "string") {
    return NextResponse.json({ error: "input requerido" }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await runGuardian({
    channel:           "web",
    userId:            user.id,
    userRole:          user.role,
    notionOperatorId:  user.notionOperatorId ?? undefined,
    rawInput:          input,
  });

  // Audit trail
  await db.insert(auditLog).values({
    userId:     user.id,
    action:     "guardian.invoke",
    entityType: "agent",
    payload:    { input, response: result.response, error: result.error } as any,
    channel:    "web",
  });

  return NextResponse.json(result);
}
