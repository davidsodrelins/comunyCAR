import paypal from 'paypal-rest-sdk';
import { getDb } from '../db';
import { paypalConfigs, paypalTransactions, creditTransactions, credits } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Serviço de PayPal para processamento de pagamentos
 */
export class PayPalService {
  private static instance: PayPalService;

  private constructor() {}

  static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  /**
   * Inicializar configuração do PayPal
   */
  async initializePayPal(): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const config = await db.select().from(paypalConfigs).where(eq(paypalConfigs.isActive, true)).limit(1);

    if (!config.length) {
      console.warn('[PayPal] No active configuration found');
      return;
    }

    const cfg = config[0];
    paypal.configure({
      mode: cfg.mode as 'sandbox' | 'production',
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    });

    console.log(`[PayPal] Initialized in ${cfg.mode} mode`);
  }

  /**
   * Criar ordem de pagamento no PayPal
   */
  async createPayment(
    userId: number,
    amount: number,
    credits: number,
    returnUrl: string,
    cancelUrl: string
  ): Promise<{ id: string; approvalUrl: string }> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const paymentDetails = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      transactions: [
        {
          amount: {
            total: amount.toFixed(2),
            currency: 'BRL',
            details: {
              subtotal: amount.toFixed(2),
            },
          },
          description: `Compra de ${credits} créditos - comunyCAR`,
          item_list: {
            items: [
              {
                name: `${credits} Créditos comunyCAR`,
                sku: `credits-${credits}`,
                price: amount.toFixed(2),
                currency: 'BRL',
                quantity: 1,
              },
            ],
          },
        },
      ],
    };

    return new Promise((resolve, reject) => {
      paypal.payment.create(paymentDetails, async (error: any, payment: any) => {
        if (error) {
          console.error('[PayPal] Error creating payment:', error);
          reject(error);
        } else {
          // Salvar transação no banco
          const approvalUrl = payment.links.find((link: any) => link.rel === 'approval_url')?.href;

          await db.insert(paypalTransactions).values({
            creditTransactionId: 0, // Será atualizado após aprovação
            paypalOrderId: payment.id,
            payerEmail: '',
            amount: amount.toFixed(2),
            currency: 'BRL',
            status: 'created',
            paypalResponse: JSON.stringify(payment),
          });

          resolve({
            id: payment.id,
            approvalUrl,
          });
        }
      });
    });
  }

  /**
   * Executar pagamento aprovado
   */
  async executePayment(
    paymentId: string,
    payerId: string,
    userId: number,
    creditsAmount: number
  ): Promise<{ success: boolean; transactionId: string }> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    return new Promise(async (resolve, reject) => {
      paypal.payment.execute(paymentId, { payer_id: payerId }, async (error: any, payment: any) => {
        if (error) {
          console.error('[PayPal] Error executing payment:', error);

          // Atualizar status da transação
          await db
            .update(paypalTransactions)
            .set({ status: 'failed' })
            .where(eq(paypalTransactions.paypalOrderId, paymentId));

          reject(error);
        } else {
          try {
            const sale = payment.transactions[0].related_resources[0].sale;

            // Atualizar status da transação
            await db
              .update(paypalTransactions)
              .set({
                status: 'completed',
                payerEmail: payment.payer.email,
                paypalResponse: JSON.stringify(payment),
              })
              .where(eq(paypalTransactions.paypalOrderId, paymentId));

            // Criar transação de crédito
            await db.insert(creditTransactions).values({
              userId,
              type: 'purchase',
              amount: creditsAmount,
              description: `Compra via PayPal - ${creditsAmount} créditos`,
              paymentMethod: 'paypal',
              transactionId: sale.id,
            });

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

            resolve({
              success: true,
              transactionId: sale.id,
            });
          } catch (err) {
            console.error('[PayPal] Error processing payment:', err);
            reject(err);
          }
        }
      });
    });
  }

  /**
   * Obter configuração ativa do PayPal
   */
  async getActiveConfig(): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const config = await db.select().from(paypalConfigs).where(eq(paypalConfigs.isActive, true)).limit(1);

    return config.length > 0 ? config[0] : null;
  }

  /**
   * Salvar ou atualizar configuração do PayPal
   */
  async saveConfig(clientId: string, clientSecret: string, mode: 'sandbox' | 'production', email: string): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const existingConfig = await db.select().from(paypalConfigs).limit(1);

    if (existingConfig.length > 0) {
      await db
        .update(paypalConfigs)
        .set({
          clientId,
          clientSecret,
          mode,
          email,
        })
        .where(eq(paypalConfigs.id, existingConfig[0].id));
    } else {
      await db.insert(paypalConfigs).values({
        clientId,
        clientSecret,
        mode,
        email,
      });
    }

    // Reinicializar PayPal
    await this.initializePayPal();
  }
}

export const paypalService = PayPalService.getInstance();
