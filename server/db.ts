import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  vehicles, vehicleUsers, fixedAlerts, alerts,
  credits, creditTransactions, notificationPreferences,
  pushTokens, whatsappConfigs, emailQueue, whatsappQueue,
  auditLogs, emailVerificationTokens, passwordResetTokens,
  Vehicle, VehicleUser, FixedAlert, Alert, Credit, CreditTransaction,
  NotificationPreference, PushToken, WhatsappConfig, EmailQueue,
  WhatsappQueue, AuditLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || `user-${user.openId}@comunycar.local`,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.email) {
      values.email = user.email;
      updateSet.email = user.email;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    } else {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ VEÍCULOS ============

export async function createVehicle(data: {
  plate: string;
  brand: string;
  model: string;
  color?: string;
  year?: number;
}): Promise<Vehicle> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vehicles).values(data);
  const id = result[0].insertId as number;
  const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return vehicle[0];
}

export async function getVehicleByPlate(plate: string): Promise<Vehicle | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(vehicles).where(eq(vehicles.plate, plate)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserVehicles(userId: number): Promise<Vehicle[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ vehicle: vehicles })
    .from(vehicleUsers)
    .innerJoin(vehicles, eq(vehicleUsers.vehicleId, vehicles.id))
    .where(eq(vehicleUsers.userId, userId));

  return result.map(r => r.vehicle);
}

export async function linkUserToVehicle(userId: number, vehicleId: number, role: 'owner' | 'secondary'): Promise<VehicleUser> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(vehicleUsers).values({ userId, vehicleId, role });
  const result = await db.select().from(vehicleUsers)
    .where(and(eq(vehicleUsers.userId, userId), eq(vehicleUsers.vehicleId, vehicleId)))
    .limit(1);
  return result[0];
}

export async function getVehicleUsers(vehicleId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ user: users, role: vehicleUsers.role })
    .from(vehicleUsers)
    .innerJoin(users, eq(vehicleUsers.userId, users.id))
    .where(eq(vehicleUsers.vehicleId, vehicleId));

  return result;
}

// ============ ALERTAS FIXOS ============

export async function getFixedAlerts(): Promise<FixedAlert[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(fixedAlerts);
}

export async function seedFixedAlerts(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existingAlerts = await db.select().from(fixedAlerts);
  if (existingAlerts.length > 0) return;

  const defaultAlerts = [
    { title: "Faróis Acesos", message: "O farol do seu veículo de placa {{PLATE}} está aceso. Por favor, verifique.", icon: "alert-circle" },
    { title: "Pneu Furado/Baixo", message: "Um dos pneus do seu veículo de placa {{PLATE}} parece estar furado ou muito baixo.", icon: "alert-triangle" },
    { title: "Porta Aberta", message: "A porta (ou porta-malas) do seu veículo de placa {{PLATE}} está aberta.", icon: "door-open" },
    { title: "Vazamento de Fluido", message: "Há um vazamento de fluido (óleo, água, etc.) sob o seu veículo de placa {{PLATE}}.", icon: "droplet" },
    { title: "Alarme Disparado", message: "O alarme do seu veículo de placa {{PLATE}} está disparado.", icon: "bell-alert" },
    { title: "Obstrução de Via", message: "Seu veículo de placa {{PLATE}} está obstruindo uma garagem/passagem.", icon: "alert-octagon" },
    { title: "Outro Problema", message: "Há um problema com seu veículo de placa {{PLATE}}. Sugiro verificar.", icon: "alert-circle" },
  ];

  await db.insert(fixedAlerts).values(defaultAlerts);
}

// ============ ALERTAS ============

export async function sendAlert(data: {
  vehicleId: number;
  senderId: number;
  fixedAlertId?: number;
  messageType: 'fixed' | 'personalized';
  customMessage?: string;
  creditsUsed?: number;
}): Promise<Alert> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(alerts).values({
    vehicleId: data.vehicleId,
    senderId: data.senderId,
    fixedAlertId: data.fixedAlertId,
    messageType: data.messageType,
    customMessage: data.customMessage,
    creditsUsed: data.creditsUsed || 0,
  });

  const id = result[0].insertId as number;
  const alert = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  return alert[0];
}

export async function getAlertsByVehicle(vehicleId: number, limit: number = 50): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(alerts)
    .where(eq(alerts.vehicleId, vehicleId))
    .orderBy(desc(alerts.sentAt))
    .limit(limit);
}

// ============ CRÉDITOS ============

export async function getUserCredits(userId: number): Promise<Credit | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function initializeUserCredits(userId: number): Promise<Credit> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserCredits(userId);
  if (existing) return existing;

  await db.insert(credits).values({ userId, balance: 0 });
  return (await getUserCredits(userId))!;
}

export async function addCredits(userId: number, amount: number, description: string, paymentMethod?: string, transactionId?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const currentCredits = await getUserCredits(userId);
  if (!currentCredits) await initializeUserCredits(userId);

  await db.update(credits).set({ balance: (currentCredits?.balance || 0) + amount }).where(eq(credits.userId, userId));

  await db.insert(creditTransactions).values({
    userId,
    type: 'purchase',
    amount,
    description,
    paymentMethod,
    transactionId,
  });
}

export async function deductCredits(userId: number, amount: number, description: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const currentCredits = await getUserCredits(userId);
  if (!currentCredits || currentCredits.balance < amount) return false;

  await db.update(credits).set({ balance: currentCredits.balance - amount }).where(eq(credits.userId, userId));

  await db.insert(creditTransactions).values({
    userId,
    type: 'usage',
    amount,
    description,
  });

  return true;
}

// ============ NOTIFICAÇÕES ============

export async function getNotificationPreferences(userId: number): Promise<NotificationPreference | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function initializeNotificationPreferences(userId: number): Promise<NotificationPreference> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getNotificationPreferences(userId);
  if (existing) return existing;

  await db.insert(notificationPreferences).values({ userId, emailEnabled: true, whatsappEnabled: false, pushEnabled: true });
  return (await getNotificationPreferences(userId))!;
}

export async function updateNotificationPreferences(userId: number, data: { emailEnabled?: boolean; whatsappEnabled?: boolean; pushEnabled?: boolean }): Promise<NotificationPreference> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notificationPreferences).set(data).where(eq(notificationPreferences.userId, userId));
  return (await getNotificationPreferences(userId))!;
}

// ============ PUSH TOKENS ============

export async function addPushToken(userId: number, token: string, platform: 'android' | 'ios' | 'web', deviceName?: string): Promise<PushToken> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(pushTokens).values({ userId, token, platform, deviceName });
  const id = result[0].insertId as number;
  const pushToken = await db.select().from(pushTokens).where(eq(pushTokens.id, id)).limit(1);
  return pushToken[0];
}

export async function getUserPushTokens(userId: number): Promise<PushToken[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pushTokens).where(and(eq(pushTokens.userId, userId), eq(pushTokens.isActive, true)));
}

// ============ AUDIT LOGS ============

export async function logAudit(data: {
  userId?: number;
  action: string;
  resourceType?: string;
  resourceId?: number;
  details?: string;
  ipAddress?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLogs).values(data);
}

// ============ EMAIL QUEUE ============

export async function queueEmail(data: {
  userId?: number;
  recipientEmail: string;
  subject: string;
  htmlContent: string;
}): Promise<EmailQueue> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailQueue).values(data);
  const id = result[0].insertId as number;
  const email = await db.select().from(emailQueue).where(eq(emailQueue.id, id)).limit(1);
  return email[0];
}

export async function getPendingEmails(limit: number = 10): Promise<EmailQueue[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(emailQueue)
    .where(eq(emailQueue.status, 'pending'))
    .orderBy(emailQueue.createdAt)
    .limit(limit);
}

// ============ WHATSAPP QUEUE ============

export async function queueWhatsappMessage(data: {
  userId?: number;
  recipientPhone: string;
  message: string;
}): Promise<WhatsappQueue> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(whatsappQueue).values(data);
  const id = result[0].insertId as number;
  const msg = await db.select().from(whatsappQueue).where(eq(whatsappQueue.id, id)).limit(1);
  return msg[0];
}

export async function getPendingWhatsappMessages(limit: number = 10): Promise<WhatsappQueue[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(whatsappQueue)
    .where(eq(whatsappQueue.status, 'pending'))
    .orderBy(whatsappQueue.createdAt)
    .limit(limit);
}

// ============ WHATSAPP CONFIG ============

export async function getWhatsappConfig(userId: number): Promise<WhatsappConfig | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(whatsappConfigs).where(eq(whatsappConfigs.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createWhatsappConfig(userId: number, phoneNumber: string): Promise<WhatsappConfig> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(whatsappConfigs).values({ userId, phoneNumber });
  const id = result[0].insertId as number;
  const config = await db.select().from(whatsappConfigs).where(eq(whatsappConfigs.id, id)).limit(1);
  return config[0];
}

export async function updateWhatsappConfig(configId: number, data: { status?: 'disconnected' | 'connecting' | 'connected' | 'error'; qrCode?: string; sessionData?: string; lastConnectedAt?: Date }): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(whatsappConfigs).set(data).where(eq(whatsappConfigs.id, configId));
}

// ============ EMAIL VERIFICATION TOKENS ============

export async function createEmailVerificationToken(userId: number, expiresAt: Date): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  await db.insert(emailVerificationTokens).values({ userId, token, expiresAt });
  return token;
}

export async function verifyEmailToken(token: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token)).limit(1);
  if (!result.length) return null;

  const record = result[0];
  if (new Date() > record.expiresAt) return null;

  await db.update(users).set({ emailVerified: true }).where(eq(users.id, record.userId));
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));

  return record.userId;
}

// ============ PASSWORD RESET TOKENS ============

export async function createPasswordResetToken(userId: number, expiresAt: Date): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
  if (!result.length) return null;

  const record = result[0];
  if (new Date() > record.expiresAt) return null;

  return record.userId;
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
}
