import { NextRequest, NextResponse } from "next/server";
import { sendMorningBriefing } from "@/lib/telegram/bot";

// Called by Vercel Cron (vercel.json) every weekday at 8:00 AM
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await sendMorningBriefing();
  return NextResponse.json({ ok: true, sentAt: new Date().toISOString() });
}
