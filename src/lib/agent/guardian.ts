/**
 * Guardian Agent — Brain OS
 * LangGraph state machine that intermediates between UI/Telegram and Notion.
 * Uses Google Vertex AI (Gemini) as the LLM backbone.
 */

import { Annotation, StateGraph, END } from "@langchain/langgraph";
import { ChatVertexAI } from "@langchain/google-vertexai";
import * as notionTools from "@/lib/notion/client";
import { sendDelivery } from "@/lib/email/resend";
import type { AgentInput, AgentOutput, Intent, QuestStatus, TaskPayload } from "@/types";

// ── LLM instance ──────────────────────────────────────────────

const llm = new ChatVertexAI({
  model: "gemini-1.5-flash",
  temperature: 0.1,
  maxOutputTokens: 1024,
  location: process.env.VERTEX_AI_LOCATION ?? "us-central1",
});

// ── State annotation ──────────────────────────────────────────

const AgentState = Annotation.Root({
  channel: Annotation<"web" | "telegram" | "cron">(),
  userId: Annotation<string>(),
  userRole: Annotation<"admin" | "operador" | "cliente">(),
  notionOperatorId: Annotation<string | null>(),
  rawInput: Annotation<string>(),
  intent: Annotation<Intent | null>(),
  missingFields: Annotation<string[]>(),
  clarificationCount: Annotation<number>(),
  notionPayload: Annotation<unknown>(),
  response: Annotation<string>(),
  error: Annotation<string | null>(),
});

type State = typeof AgentState.State;

// ── RBAC config ───────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, Intent["type"][]> = {
  admin:    ["create_task", "update_status", "query_tasks"],
  operador: ["update_status", "query_tasks"],
  cliente:  ["create_task"],
};

const REQUIRED_FIELDS: Record<string, string[]> = {
  create_task:   ["clientName", "description", "dueDate"],
  update_status: ["taskId", "status"],
  query_tasks:   [],
};

const FIELD_LABELS: Record<string, string> = {
  clientName:  "el nombre del cliente",
  description: "una descripción de la tarea",
  dueDate:     "la fecha de entrega (DD/MM/AAAA)",
  taskId:      "el ID de la tarea",
  status:      "el nuevo estado",
};

// ── NODES ─────────────────────────────────────────────────────

async function parseIntent(state: State): Promise<Partial<State>> {
  const systemPrompt = `
Eres el parser de intenciones de Brain OS, una agencia creativa.
Extrae del texto del usuario la intención y sus datos.

Devuelve SOLO JSON válido con esta estructura:
{
  "type": "create_task" | "update_status" | "query_tasks" | "unknown",
  "data": {
    // create_task: clientName, description, dueDate (ISO), priority ("main"|"side")
    // update_status: taskId, status ("pendiente"|"en_progreso"|"bloqueada"|"entregada")
    // query_tasks: operatorId (opcional), date (ISO opcional)
  }
}

Rol del usuario: ${state.userRole}. Si el rol es "cliente", la única intención válida es "create_task".
Fecha actual: ${new Date().toISOString().split("T")[0]}
`;

  try {
    const result = await llm.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: state.rawInput },
    ]);

    const text = typeof result.content === "string"
      ? result.content
      : JSON.stringify(result.content);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const intent = JSON.parse(jsonMatch[0]) as Intent;
    return { intent };
  } catch {
    return { intent: { type: "unknown" } };
  }
}

async function authorize(state: State): Promise<Partial<State>> {
  if (!state.intent || state.intent.type === "unknown") {
    return {
      error: "UNKNOWN_INTENT",
      response: "No entendí tu solicitud. Por favor intenta de nuevo con más detalle.",
    };
  }

  const allowed = ROLE_PERMISSIONS[state.userRole] ?? [];
  if (!allowed.includes(state.intent.type)) {
    return {
      error: "UNAUTHORIZED",
      response: "No tienes permiso para realizar esta acción.",
    };
  }

  return {};
}

async function validateFields(state: State): Promise<Partial<State>> {
  if (!state.intent || ["unknown"].includes(state.intent.type)) return {};

  const required = REQUIRED_FIELDS[state.intent.type] ?? [];
  const data = (state.intent as any).data ?? {};
  const missing = required.filter((f) => !data[f]);

  return { missingFields: missing };
}

async function requestClarification(state: State): Promise<Partial<State>> {
  if (state.clarificationCount >= 2) {
    return {
      error: "INCOMPLETE",
      response:
        "No pude procesar tu solicitud por datos incompletos. Por favor intenta de nuevo incluyendo toda la información.",
    };
  }

  const asks = state.missingFields
    .map((f) => FIELD_LABELS[f] ?? f)
    .join(", ");

  return {
    response: `Para continuar necesito que me indiques: ${asks}.`,
    clarificationCount: state.clarificationCount + 1,
  };
}

async function executeAction(state: State): Promise<Partial<State>> {
  if (!state.intent) return { error: "NO_INTENT" };

  try {
    switch (state.intent.type) {
      case "create_task": {
        const d = state.intent.data as Partial<TaskPayload>;
        const client = await notionTools.findClient(d.clientName!);

        if (!client) {
          return {
            error: "CLIENT_NOT_FOUND",
            response: `No encontré al cliente "${d.clientName}". Verifica el nombre e intenta de nuevo.`,
          };
        }

        const task = await notionTools.createTask({
          title:       d.description!,
          description: d.description!,
          clientName:  client.name,
          clientId:    client.id,
          dueDate:     d.dueDate!,
          priority:    d.priority ?? "side",
          assigneeId:  state.notionOperatorId ?? "",
          status:      "pendiente",
          source:      state.channel,
        });

        return {
          response: `Quest creada ✓\nID: ${task.id}\n"${d.description}" para ${client.name}\nEntrega: ${d.dueDate}`,
          notionPayload: task,
        };
      }

      case "update_status": {
        const { taskId, status } = state.intent.data as { taskId: string; status: QuestStatus };
        const updated = await notionTools.updateTaskStatus(taskId, status);

        if (status === "entregada" && updated.clientEmail) {
          await sendDelivery({
            to:           updated.clientEmail,
            clientName:   updated.client,
            taskTitle:    updated.title,
            deliverables: updated.deliverables ?? [],
            credentials:  null,
          });
        }

        return {
          response: `Estado actualizado a "${status}" ✓${
            status === "entregada" ? "\nEmail de entrega enviado al cliente." : ""
          }`,
          notionPayload: updated,
        };
      }

      case "query_tasks": {
        if (!state.notionOperatorId) {
          return { error: "NO_OPERATOR", response: "No encontré tu perfil de operador." };
        }

        const tasks = await notionTools.getTasksForOperator(state.notionOperatorId);
        const summary = formatTasksText(tasks);

        return { response: summary, notionPayload: tasks };
      }

      default:
        return { error: "UNHANDLED", response: "Acción no implementada." };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { error: "EXECUTION_ERROR", response: `Error al procesar: ${msg}` };
  }
}

// ── Routing ───────────────────────────────────────────────────

function routeAfterAuth(state: State): string {
  if (state.error) return END;
  return "validate_fields";
}

function routeAfterValidation(state: State): string {
  if (state.missingFields.length > 0) return "request_clarification";
  return "execute_action";
}

function routeAfterClarification(state: State): string {
  if (state.error) return END;
  return "parse_intent";
}

// ── Graph ─────────────────────────────────────────────────────

const graph = new StateGraph(AgentState)
  .addNode("parse_intent",           parseIntent)
  .addNode("authorize",              authorize)
  .addNode("validate_fields",        validateFields)
  .addNode("request_clarification",  requestClarification)
  .addNode("execute_action",         executeAction)
  .addEdge("__start__",              "parse_intent")
  .addEdge("parse_intent",           "authorize")
  .addConditionalEdges("authorize",              routeAfterAuth)
  .addConditionalEdges("validate_fields",        routeAfterValidation)
  .addConditionalEdges("request_clarification",  routeAfterClarification)
  .addEdge("execute_action",         END);

export const guardianAgent = graph.compile();

// ── Entry point ───────────────────────────────────────────────

export async function runGuardian(
  input: AgentInput & { notionOperatorId?: string }
): Promise<AgentOutput> {
  const result = await guardianAgent.invoke({
    channel:            input.channel,
    userId:             input.userId,
    userRole:           input.userRole,
    notionOperatorId:   input.notionOperatorId ?? null,
    rawInput:           input.rawInput,
    intent:             null,
    missingFields:      [],
    clarificationCount: 0,
    notionPayload:      null,
    response:           "",
    error:              null,
  });

  return {
    response: result.response,
    error:    result.error,
    payload:  result.notionPayload,
  };
}

// ── Utils ─────────────────────────────────────────────────────

function formatTasksText(tasks: Awaited<ReturnType<typeof notionTools.getTasksForOperator>>): string {
  if (tasks.length === 0) return "No tienes tareas pendientes. ¡Bien hecho!";

  const main = tasks.filter((t) => t.priority === "main");
  const side = tasks.filter((t) => t.priority === "side");

  const fmt = (t: (typeof tasks)[0]) =>
    `• [${t.id}] ${t.title} — ${t.client} (entrega: ${t.dateDue})`;

  const lines: string[] = ["🎮 TUS MISIONES DE HOY\n"];
  if (main.length) {
    lines.push("⚡ MAIN QUESTS:");
    main.forEach((t) => lines.push(fmt(t)));
  }
  if (side.length) {
    lines.push("\n🛡 SIDE QUESTS:");
    side.forEach((t) => lines.push(fmt(t)));
  }

  return lines.join("\n");
}
