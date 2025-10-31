import { eq } from 'drizzle-orm';
import { getDb } from './db';
import {
  paypalConfigs,
  paypalTransactions,
  firebaseConfigs,
  pushNotifications,
  credits,
  creditTransactions,
} from '../drizzle/schema';

/**
 * Helpers de banco de dados para PayPal e Firebase
 */

// ============ PayPal Helpers ============

export async function getPayPalConfig() {
  const db = await getDb();
  if (!db) return null;

  const config = await db.select().from(paypalConfigs).where(eq(paypalConfigs.isActive, true)).limit(1);

  return config.length > 0 ? config[0] : null;
}

export async function savePayPalConfig(
  clientId: string,
  clientSecret: string,
  mode: 'sandbox' | 'production',
  email: string,
  webhookId?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await db.select().from(paypalConfigs).limit(1);

  if (existing.length > 0) {
    return await db
      .update(paypalConfigs)
      .set({
        clientId,
        clientSecret,
        mode,
        email,
        webhookId,
      })
      .where(eq(paypalConfigs.id, existing[0].id));
  } else {
    return await db.insert(paypalConfigs).values({
      clientId,
      clientSecret,
      mode,
      email,
      webhookId,
    });
  }
}

export async function getPayPalTransaction(paypalOrderId: string) {
  const db = await getDb();
  if (!db) return null;

  const transaction = await db
    .select()
    .from(paypalTransactions)
    .where(eq(paypalTransactions.paypalOrderId, paypalOrderId))
    .limit(1);

  return transaction.length > 0 ? transaction[0] : null;
}

export async function updatePayPalTransaction(
  paypalOrderId: string,
  status: string,
  payerEmail?: string,
  paypalResponse?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .update(paypalTransactions)
    .set({
      status: status as any,
      payerEmail,
      paypalResponse,
      updatedAt: new Date(),
    })
    .where(eq(paypalTransactions.paypalOrderId, paypalOrderId));
}

export async function getPayPalTransactionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const transactions = await db
    .select()
    .from(paypalTransactions)
    .innerJoin(creditTransactions, eq(paypalTransactions.creditTransactionId, creditTransactions.id))
    .where(eq(creditTransactions.userId, userId));

  return transactions;
}

// ============ Firebase Helpers ============

export async function getFirebaseConfig() {
  const db = await getDb();
  if (!db) return null;

  const config = await db.select().from(firebaseConfigs).where(eq(firebaseConfigs.isActive, true)).limit(1);

  return config.length > 0 ? config[0] : null;
}

export async function saveFirebaseConfig(
  projectId: string,
  privateKey: string,
  clientEmail: string,
  clientId: string,
  authUri?: string,
  tokenUri?: string,
  authProviderX509CertUrl?: string,
  clientX509CertUrl?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await db.select().from(firebaseConfigs).limit(1);

  if (existing.length > 0) {
    return await db
      .update(firebaseConfigs)
      .set({
        projectId,
        privateKey,
        clientEmail,
        clientId,
        authUri,
        tokenUri,
        authProviderX509CertUrl,
        clientX509CertUrl,
      })
      .where(eq(firebaseConfigs.id, existing[0].id));
  } else {
    return await db.insert(firebaseConfigs).values({
      projectId,
      privateKey,
      clientEmail,
      clientId,
      authUri,
      tokenUri,
      authProviderX509CertUrl,
      clientX509CertUrl,
    });
  }
}

export async function logPushNotification(
  userId: number,
  title: string,
  body: string,
  status: 'pending' | 'sent' | 'failed',
  firebaseMessageId?: string,
  failureReason?: string,
  alertId?: number,
  data?: Record<string, string>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db.insert(pushNotifications).values({
    userId,
    alertId,
    title,
    body,
    data: data ? JSON.stringify(data) : null,
    status,
    firebaseMessageId,
    failureReason,
    sentAt: status === 'sent' ? new Date() : null,
  });
}

export async function getPushNotificationHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pushNotifications)
    .where(eq(pushNotifications.userId, userId))
    .orderBy((table) => table.createdAt)
    .limit(limit);
}

// ============ Credits Helpers ============

export async function addCreditsFromPayment(
  userId: number,
  creditsAmount: number,
  paymentMethod: string,
  transactionId: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Criar transação de crédito
  await db.insert(creditTransactions).values({
    userId,
    type: 'purchase',
    amount: creditsAmount,
    description: `Compra via ${paymentMethod}`,
    paymentMethod,
    transactionId,
  });

  // Atualizar saldo
  const userCredits = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);

  if (userCredits.length > 0) {
    await db
      .update(credits)
      .set({ balance: userCredits[0].balance + creditsAmount })
      .where(eq(credits.userId, userId));
  } else {
    await db.insert(credits).values({
      userId,
      balance: creditsAmount,
    });
  }
}
