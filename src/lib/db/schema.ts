import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  bigint,
  boolean,
  inet,
  jsonb,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "operador",
  "cliente",
]);
export const userStatusEnum = pgEnum("user_status", [
  "activo",
  "inactivo",
  "pendiente",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("cliente"),
  status: userStatusEnum("status").notNull().default("activo"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  notionClientId: text("notion_client_id").unique(),
  notionOperatorId: text("notion_operator_id").unique(),
  telegramChatId: bigint("telegram_chat_id", { mode: "number" }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: inet("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export const auditLog = pgTable("audit_log", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  payload: jsonb("payload"),
  channel: text("channel").default("web"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const telegramTokens = pgTable("telegram_tokens", {
  token: text("token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  used: boolean("used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;
