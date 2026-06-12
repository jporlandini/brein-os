export type UserRole = "admin" | "operador" | "cliente";
export type UserStatus = "activo" | "inactivo" | "pendiente";

export type QuestPriority = "main" | "side";
export type QuestStatus =
  | "pendiente"
  | "en_progreso"
  | "bloqueada"
  | "entregada";

export interface Quest {
  id: string;
  title: string;
  client: string;
  clientEmail?: string;
  description: string;
  assignee: string;
  assigneeId: string;
  dateIn: string;
  dateDue: string;
  status: QuestStatus;
  priority: QuestPriority;
  tags?: string[];
  notionId: string;
  deliverables?: string[];
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  notionId: string;
  telegramChatId?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  notionId: string;
}

export interface AgentInput {
  channel: "web" | "telegram" | "cron";
  userId: string;
  userRole: UserRole;
  rawInput: string;
}

export interface AgentOutput {
  response: string;
  error: string | null;
  payload?: unknown;
}

export type TaskPayload = {
  title: string;
  clientName: string;
  clientId: string;
  description: string;
  dueDate: string;
  priority: QuestPriority;
  assigneeId: string;
  status: QuestStatus;
  source: string;
};

export type Intent =
  | { type: "create_task"; data: Partial<TaskPayload> }
  | { type: "update_status"; data: { taskId: string; status: QuestStatus } }
  | { type: "query_tasks"; data: { operatorId?: string; date?: string } }
  | { type: "unknown" };
