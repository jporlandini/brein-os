import { Client } from "@notionhq/client";
import type { Quest, QuestStatus, TaskPayload } from "@/types";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DB = {
  tasks: process.env.NOTION_DB_TASKS!,
  clients: process.env.NOTION_DB_CLIENTS!,
  operators: process.env.NOTION_DB_OPERATORS!,
};

// ── Helpers ───────────────────────────────────────────────────

function prop(page: any, name: string) {
  return page.properties?.[name];
}

function richText(p: any): string {
  return p?.rich_text?.[0]?.plain_text ?? "";
}

function title(p: any): string {
  return p?.title?.[0]?.plain_text ?? "";
}

function select(p: any): string {
  return p?.select?.name ?? "";
}

function relation(p: any): string {
  return p?.relation?.[0]?.id ?? "";
}

function date(p: any): string {
  return p?.date?.start ?? "";
}

function email(p: any): string {
  return p?.email ?? "";
}

// ── Task mapping ──────────────────────────────────────────────

function pageToQuest(page: any): Quest {
  const p = page.properties;
  return {
    notionId: page.id,
    id: richText(prop(page, "ID")) || page.id.slice(0, 8).toUpperCase(),
    title: title(prop(page, "Nombre")),
    client: title(prop(page, "Cliente")) || richText(prop(page, "Cliente")),
    clientEmail: email(prop(page, "Email Cliente")),
    description: richText(prop(page, "Descripción")),
    assignee: richText(prop(page, "Encargado")),
    assigneeId: relation(prop(page, "Operador")),
    dateIn: date(prop(page, "Fecha Ingreso")),
    dateDue: date(prop(page, "Fecha Entrega")),
    status: (select(prop(page, "Estado")) || "pendiente") as Quest["status"],
    priority: (select(prop(page, "Prioridad")) || "side") as Quest["priority"],
    tags: p?.Tags?.multi_select?.map((t: any) => t.name) ?? [],
    deliverables:
      p?.Entregables?.files?.map((f: any) => f.external?.url ?? f.file?.url) ??
      [],
  };
}

// ── Public API ────────────────────────────────────────────────

export async function getTasksForOperator(notionOperatorId: string): Promise<Quest[]> {
  const response = await notion.databases.query({
    database_id: DB.tasks,
    filter: {
      and: [
        {
          property: "Operador",
          relation: { contains: notionOperatorId },
        },
        {
          property: "Estado",
          select: { does_not_equal: "entregada" },
        },
      ],
    },
    sorts: [{ property: "Fecha Entrega", direction: "ascending" }],
  });

  return response.results.map(pageToQuest);
}

export async function findClient(name: string) {
  const response = await notion.databases.query({
    database_id: DB.clients,
    filter: {
      property: "Nombre",
      title: { contains: name },
    },
  });

  if (!response.results[0]) return null;

  const page = response.results[0] as any;
  return {
    id: page.id,
    name: title(prop(page, "Nombre")),
    email: email(prop(page, "Email")),
  };
}

export async function createTask(payload: TaskPayload): Promise<{ id: string }> {
  const page = await notion.pages.create({
    parent: { database_id: DB.tasks },
    properties: {
      Nombre: { title: [{ text: { content: payload.title } }] },
      Descripción: {
        rich_text: [{ text: { content: payload.description ?? "" } }],
      },
      Estado: { select: { name: payload.status } },
      Prioridad: { select: { name: payload.priority } },
      "Fecha Entrega": { date: { start: payload.dueDate } },
      "Fecha Ingreso": { date: { start: new Date().toISOString().split("T")[0] } },
      Cliente: { relation: [{ id: payload.clientId }] },
      ...(payload.assigneeId
        ? { Operador: { relation: [{ id: payload.assigneeId }] } }
        : {}),
      Fuente: { select: { name: payload.source } },
    },
  });

  return { id: page.id };
}

export async function updateTaskStatus(
  notionTaskId: string,
  status: QuestStatus
): Promise<Quest & { clientEmail: string }> {
  const updated = await notion.pages.update({
    page_id: notionTaskId,
    properties: {
      Estado: { select: { name: status } },
    },
  });

  const page = await notion.pages.retrieve({ page_id: notionTaskId }) as any;
  const quest = pageToQuest(page);

  // Fetch client email if relation exists
  let clientEmail = quest.clientEmail ?? "";
  if (!clientEmail && quest.assigneeId) {
    const clientPage = await notion.pages.retrieve({ page_id: relation(prop(page, "Cliente")) }).catch(() => null) as any;
    if (clientPage) clientEmail = email(prop(clientPage, "Email"));
  }

  return { ...quest, clientEmail };
}
