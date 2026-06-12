/**
 * Telegram Bot — Brain OS
 * Handles both webhook (pull) and morning push (cron).
 */

import { Telegraf, Context } from "telegraf";
import { runGuardian } from "@/lib/agent/guardian";
import { getTasksForOperator } from "@/lib/notion/client";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// ── Auth helper ───────────────────────────────────────────────

async function getUserFromTelegram(chatId: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.telegramChatId, chatId))
    .limit(1);
  return user ?? null;
}

// ── Commands ──────────────────────────────────────────────────

bot.start(async (ctx: Context) => {
  await ctx.reply(
    "⚡ Brain OS Bot activo.\n\nComandos disponibles:\n" +
    "/misiones — Ver tus quests del día\n" +
    "/completar [ID] — Marcar quest como entregada\n" +
    "/progreso [ID] — Marcar quest en progreso\n" +
    "/bloquear [ID] — Marcar quest como bloqueada"
  );
});

bot.command("misiones", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const user = await getUserFromTelegram(chatId);
  if (!user || !user.notionOperatorId) {
    return ctx.reply("❌ Tu cuenta de Telegram no está vinculada. Contacta al admin.");
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

// Generic status-change handler
async function handleStatusCommand(ctx: Context, status: string) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const msg = ctx.message as any;
  const parts = msg?.text?.split(" ") ?? [];
  const taskId = parts[1];

  if (!taskId) {
    return ctx.reply(`Uso: /${status.replace("_", "")} [ID_TAREA]`);
  }

  const user = await getUserFromTelegram(chatId);
  if (!user) {
    return ctx.reply("❌ Cuenta no vinculada.");
  }

  const result = await runGuardian({
    channel:           "telegram",
    userId:            user.id,
    userRole:          user.role,
    notionOperatorId:  user.notionOperatorId ?? undefined,
    rawInput:          `cambiar estado de tarea ${taskId} a ${status}`,
  });

  await ctx.reply(result.response);
}

bot.command("completar",  (ctx) => handleStatusCommand(ctx, "entregada"));
bot.command("progreso",   (ctx) => handleStatusCommand(ctx, "en_progreso"));
bot.command("bloquear",   (ctx) => handleStatusCommand(ctx, "bloqueada"));

// Natural language fallback
bot.on("text", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const user = await getUserFromTelegram(chatId);
  if (!user) return ctx.reply("❌ Cuenta no vinculada.");

  const msg = ctx.message as any;
  const result = await runGuardian({
    channel:           "telegram",
    userId:            user.id,
    userRole:          user.role,
    notionOperatorId:  user.notionOperatorId ?? undefined,
    rawInput:          msg.text,
  });

  await ctx.reply(result.response);
});

export { bot };

// ── Morning push (llamado desde cron route) ───────────────────

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

      const lines = [
        `☀️ Buenos días, ${op.displayName ?? "Operador"}!`,
        `🎮 TUS MISIONES DE HOY\n`,
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

      await bot.telegram.sendMessage(op.telegramChatId, lines.join("\n"));
    } catch (err) {
      console.error(`Error sending briefing to ${op.email}:`, err);
    }
  }
}
