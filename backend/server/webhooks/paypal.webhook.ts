import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { paypalTransactions, creditTransactions, credits } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Webhook handler para eventos do PayPal
 */
const paypalWebhookRouter = Router();

/**
 * Verificar assinatura do webhook PayPal
 */
async function verifyPayPalSignature(req: Request, webhookId: string, secret: string): Promise<boolean> {
  try {
    // Para desenvolvimento/teste, você pode desabilitar a verificação
    if (process.env.PAYPAL_WEBHOOK_VERIFY === 'false') {
      return true;
    }

    // Em produção, implementar verificação real com PayPal
    // Documentação: https://developer.paypal.com/docs/api/webhooks/v1/
    return true;
  } catch (error) {
    console.error('[PayPal Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * Processar evento de pagamento aprovado
 */
async function handlePaymentApproved(event: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const orderId = event.resource?.id;
  if (!orderId) return;

  // Atualizar status da transação
  await db
    .update(paypalTransactions)
    .set({
      status: 'approved',
      paypalResponse: JSON.stringify(event.resource),
    })
    .where(eq(paypalTransactions.paypalOrderId, orderId));

  console.log(`[PayPal Webhook] Payment approved: ${orderId}`);
}

/**
 * Processar evento de pagamento completado
 */
async function handlePaymentCompleted(event: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const orderId = event.resource?.id;
  if (!orderId) return;

  // Buscar transação
  const transaction = await db
    .select()
    .from(paypalTransactions)
    .where(eq(paypalTransactions.paypalOrderId, orderId))
    .limit(1);

  if (!transaction.length) {
    console.warn(`[PayPal Webhook] Transaction not found: ${orderId}`);
    return;
  }

  const txn = transaction[0];

  // Buscar transação de crédito associada
  const creditTxn = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.id, txn.creditTransactionId))
    .limit(1);

  if (!creditTxn.length) {
    console.warn(`[PayPal Webhook] Credit transaction not found for PayPal transaction: ${orderId}`);
    return;
  }

  const userId = creditTxn[0].userId;
  const creditsAmount = creditTxn[0].amount;

  // Atualizar saldo de créditos
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

  // Atualizar status da transação PayPal
  await db
    .update(paypalTransactions)
    .set({
      status: 'completed',
      payerEmail: event.resource?.payer?.email_address,
      paypalResponse: JSON.stringify(event.resource),
    })
    .where(eq(paypalTransactions.paypalOrderId, orderId));

  console.log(`[PayPal Webhook] Payment completed: ${orderId} - User: ${userId} - Credits: ${creditsAmount}`);
}

/**
 * Processar evento de pagamento cancelado
 */
async function handlePaymentCancelled(event: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const orderId = event.resource?.id;
  if (!orderId) return;

  // Atualizar status da transação
  await db
    .update(paypalTransactions)
    .set({
      status: 'cancelled',
      paypalResponse: JSON.stringify(event.resource),
    })
    .where(eq(paypalTransactions.paypalOrderId, orderId));

  console.log(`[PayPal Webhook] Payment cancelled: ${orderId}`);
}

/**
 * Processar evento de pagamento falhado
 */
async function handlePaymentFailed(event: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const orderId = event.resource?.id;
  if (!orderId) return;

  // Atualizar status da transação
  await db
    .update(paypalTransactions)
    .set({
      status: 'failed',
      paypalResponse: JSON.stringify(event.resource),
    })
    .where(eq(paypalTransactions.paypalOrderId, orderId));

  console.log(`[PayPal Webhook] Payment failed: ${orderId}`);
}

/**
 * Endpoint principal do webhook
 */
paypalWebhookRouter.post('/paypal', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    const eventType = event.event_type;

    console.log(`[PayPal Webhook] Received event: ${eventType}`);

    // Verificar assinatura (opcional em desenvolvimento)
    // const isValid = await verifyPayPalSignature(req, webhookId, secret);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // Processar eventos
    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED':
        await handlePaymentApproved(event);
        break;
      case 'CHECKOUT.ORDER.COMPLETED':
        await handlePaymentCompleted(event);
        break;
      case 'CHECKOUT.ORDER.CANCELLED':
        await handlePaymentCancelled(event);
        break;
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(event);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentFailed(event);
        break;
      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
    }

    // Responder com sucesso
    res.status(200).json({ success: true, eventType });
  } catch (error: any) {
    console.error('[PayPal Webhook] Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default paypalWebhookRouter;
