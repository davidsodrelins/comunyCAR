import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  cnpj: varchar("cnpj", { length: 18 }).unique(), // Format: XX.XXX.XXX/XXXX-XX
  password: text("password"), // Hash da senha (bcrypt)
  emailVerified: boolean("emailVerified").default(false).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Veículos cadastrados no sistema
 */
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  plate: varchar("plate", { length: 20 }).notNull().unique(), // Formato: ABC-1234 ou ABC1D34
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  color: varchar("color", { length: 50 }),
  year: int("year"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Vinculação entre usuários e veículos (Owner ou Secundário)
 */
export const vehicleUsers = mysqlTable("vehicle_users", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  vehicleId: int("vehicle_id").notNull(),
  role: mysqlEnum("role", ["owner", "secondary"]).notNull(), // Owner ou Secundário
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VehicleUser = typeof vehicleUsers.$inferSelect;
export type InsertVehicleUser = typeof vehicleUsers.$inferInsert;

/**
 * Alertas fixos predefinidos no sistema
 */
export const fixedAlerts = mysqlTable("fixed_alerts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  message: text("message").notNull(),
  icon: varchar("icon", { length: 50 }), // Nome do ícone (ex: "alert-circle", "zap", etc)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FixedAlert = typeof fixedAlerts.$inferSelect;
export type InsertFixedAlert = typeof fixedAlerts.$inferInsert;

/**
 * Alertas enviados (fixos ou personalizados)
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicle_id").notNull(),
  senderId: int("sender_id").notNull(), // Usuário que enviou o alerta
  fixedAlertId: int("fixed_alert_id"), // NULL se for alerta personalizado
  messageType: mysqlEnum("messageType", ["fixed", "personalized"]).notNull(),
  customMessage: text("customMessage"), // Para alertas personalizados
  creditsUsed: int("credits_used").default(0).notNull(), // 0 para alertas fixos
  status: mysqlEnum("status", ["sent", "delivered", "read"]).default("sent").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  deliveredAt: timestamp("deliveredAt"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Créditos dos usuários
 */
export const credits = mysqlTable("credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  balance: int("balance").default(0).notNull(), // Saldo em créditos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Credit = typeof credits.$inferSelect;
export type InsertCredit = typeof credits.$inferInsert;

/**
 * Transações de créditos (compra ou envio)
 */
export const creditTransactions = mysqlTable("credit_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["purchase", "usage"]).notNull(), // purchase = compra, usage = envio de mensagem
  amount: int("amount").notNull(), // Quantidade de créditos
  description: text("description"),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // stripe, paypal, etc (NULL para usage)
  transactionId: varchar("transactionId", { length: 100 }), // ID externo do pagamento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Preferências de notificação do usuário
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  whatsappEnabled: boolean("whatsapp_enabled").default(false).notNull(),
  pushEnabled: boolean("push_enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Tokens de push para notificações (Firebase Cloud Messaging)
 */
export const pushTokens = mysqlTable("push_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  token: text("token").notNull(),
  platform: mysqlEnum("platform", ["android", "ios", "web"]).notNull(),
  deviceName: varchar("deviceName", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = typeof pushTokens.$inferInsert;

/**
 * Configuração WhatsApp para envio de mensagens
 */
export const whatsappConfigs = mysqlTable("whatsapp_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["disconnected", "connecting", "connected", "error"]).default("disconnected").notNull(),
  qrCode: text("qrCode"), // QR code para conectar
  sessionData: text("sessionData"), // Dados da sessão (criptografados)
  lastConnectedAt: timestamp("lastConnectedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappConfig = typeof whatsappConfigs.$inferSelect;
export type InsertWhatsappConfig = typeof whatsappConfigs.$inferInsert;

/**
 * Fila de emails a enviar
 */
export const emailQueue = mysqlTable("email_queue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  htmlContent: text("htmlContent").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  attempts: int("attempts").default(0).notNull(),
  lastAttemptAt: timestamp("lastAttemptAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailQueue = typeof emailQueue.$inferSelect;
export type InsertEmailQueue = typeof emailQueue.$inferInsert;

/**
 * Fila de mensagens WhatsApp a enviar
 */
export const whatsappQueue = mysqlTable("whatsapp_queue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  recipientPhone: varchar("recipientPhone", { length: 20 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  attempts: int("attempts").default(0).notNull(),
  lastAttemptAt: timestamp("lastAttemptAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappQueue = typeof whatsappQueue.$inferSelect;
export type InsertWhatsappQueue = typeof whatsappQueue.$inferInsert;

/**
 * Logs de auditoria (rastreamento de ações)
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  action: varchar("action", { length: 100 }).notNull(), // "send_alert", "buy_credits", etc
  resourceType: varchar("resourceType", { length: 50 }), // "alert", "vehicle", "credit", etc
  resourceId: int("resourceId"),
  details: text("details"), // JSON com detalhes da ação
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Email verification tokens (para confirmação de email)
 */
export const emailVerificationTokens = mysqlTable("email_verification_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

/**
 * Password reset tokens (para recuperação de senha)
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
