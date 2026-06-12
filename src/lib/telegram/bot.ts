/**
 * Telegram Bot — Brain OS
 * Lazy initialization: Telegraf is only instantiated on first use,
 * so importing this module at build time won't throw missing env errors.
 */

import { Telegraf, type Context } from "telegraf";
import { runGuardian } from "@/lib/agent/guardian";
import { getTasksForOperator } from "@/lib/notion/client";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// ── Auth helper ───────────────────────────────────────────────

async function getUserFromTelegram(chatId: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.telegramChatId, chatId))
    .limit(1);
  return user ?? null;
}

// ── Status command handler ────────────────────────────────────

async function handleStatusCommand(ctx: Context, status: string) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const msg = ctx.message as { text?: string } | undefined;
  const parts = msg?.text?.split(" ") ?? [];
  const taskId = parts[1];

  if (!taskId) {
    return ctx.reply(`Uso: /${status.replace("_", "")} [ID_TAREA]`);
  }

  const user = await getUserFromTelegram(chatId);
  if (!user) return ctx.reply("❌ Cuenta no vinculada.");

  const result = await runGuardian({
    channel:           "telegram",
    userId:            user.id,
    userRole:          user.role,
    notionOperatorId:  user.notionOperatorId ?? undefined,
    rawInput:          `cambiar estado de tarea ${taskId} a ${status}`,
  });

  await ctx.reply(result.response);
}

// ── Bot factory ───────────────────────────────────────────────

function createBot(): Telegraf {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const instance = new Telegraf(token);

  instance.start(async (ctx) => {
    await ctx.reply(
      "⚡ Brain OS Bot activo.\n\n" +
      "/misiones — Ver tus quests del día\n" +
      "/completar [ID] — Marcar como entregada\n" +
      "/progreso [ID] — Marcar en progreso\n" +
      "/bloquear [ID] — Marcar como bloqueada"
    );
  });

  instance.command("misiones", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const user = await getUserFromTelegram(chatId);
    if (!user?.notionOperatorId) {
      return ctx.reply("❌ Tu cuenta no está vinculada. Contacta al admin.");
    }

    const result = await runGuardian({
      channel:           "telegram",
      userId:            user.id,
      userRole:          user.role,
      notionOperatorId:  user.notionOperatorId,
      rawInput:          "mostrar mis tareas pendientes",
    });

    await ctx.reply(result.response);
  });

  instance.command("completar", (ctx) => handleStatusCommand(ctx, "entregada"));
  instance.command("progreso",  (ctx) => handleStatusCommand(ctx, "en_progreso"));
  instance.command("bloquear",  (ctx) => handleStatusCommand(ctx, "bloqueada"));

  instance.on("text", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const user = await getUserFromTelegram(chatId);
    if (!user) return ctx.reply("❌ Cuenta no vinculada.");

    const msg = ctx.message as { text?: string };
    const result = await runGuardian({
      channel:           "telegram",
      userId:            user.id,
      userRole:          user.role,
      notionOperatorId:  user.notionOperatorId ?? undefined,
      rawInput:          msg.text ?? "",
    });

    await ctx.reply(result.response);
  });

  return instance;
}

let _bot: Telegraf | null = null;
export function getBot(): Telegraf {
  if (!_bot) _bot = createBot();
  return _bot;
}

// ── Morning push ──────────────────────────────────────────────

export async function sendMorningBriefing() {
  const operators = await db
    .select()
    .from(users)
    .where(eq(users.role, "operador"));

  for (const op of operators) {
    if (!op.telegramChatId || !op.notionOperatorId) continue;

    try {
      const tasks = await getTasksForOperator(op.notionOperatorId);
      if (tasks.length === 0) continue;

      const main = tasks.filter((t) => t.priority === "main");
      const side = tasks.filter((t) => t.priority === "side");

      const lines: string[] = [
        `☀️ Buenos días, ${op.displayName ?? "Operador"}!`,
        "🎮 TUS MISIONES DE HOY\n",
      ];

      if (main.length) {
        lines.push("⚡ MAIN QUESTS:");
        main.forEach((t) =>
          lines.push(`  • [${t.id}] ${t.title}\n    Cliente: ${t.client} · Entrega: ${t.dateDue}`)
        );
      }
      if (side.length) {
        lines.push("\n🛡 SIDE QUESTS:");
        side.forEach((t) =>
          lines.push(`  • [${t.id}] ${t.title}\n    Cliente: ${t.client} · Entrega: ${t.dateDue}`)
        );
      }

      lines.push("\nUsa /completar [ID] para actualizar estados.");
      await getBot().telegram.sendMessage(op.telegramChatId, lines.join("\n"));
    } catch (err) {
      console.error(`Error sending briefing to ${op.email}:`, err);
    }
  }
}
