import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { paypalService } from '../services/paypal.service';
import { firebaseService } from '../services/firebase.service';
import {
  getPayPalConfig,
  savePayPalConfig,
  getFirebaseConfig,
  saveFirebaseConfig,
  addCreditsFromPayment,
  getPayPalTransactionsByUser,
} from '../db-integrations';
import { TRPCError } from '@trpc/server';

/**
 * Router tRPC para pagamentos (PayPal e Firebase)
 */
export const paymentsRouter = router({
  // ============ PayPal Endpoints ============

  /**
   * Criar pagamento no PayPal
   */
  createPayment: protectedProcedure
    .input(
      z.object({
        creditsAmount: z.number().min(1),
        amount: z.number().min(0.01),
        returnUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Inicializar PayPal
        await paypalService.initializePayPal();

        const payment = await paypalService.createPayment(
          ctx.user.id,
          input.amount,
          input.creditsAmount,
          input.returnUrl,
          input.cancelUrl
        );

        return {
          success: true,
          paymentId: payment.id,
          approvalUrl: payment.approvalUrl,
        };
      } catch (error: any) {
        console.error('[Payments] Error creating payment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao criar pagamento no PayPal',
        });
      }
    }),

  /**
   * Executar pagamento aprovado
   */
  executePayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        payerId: z.string(),
        creditsAmount: z.number().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await paypalService.initializePayPal();

        const result = await paypalService.executePayment(
          input.paymentId,
          input.payerId,
          ctx.user.id,
          input.creditsAmount
        );

        if (result.success) {
          return {
            success: true,
            transactionId: result.transactionId,
            message: 'Pagamento realizado com sucesso!',
          };
        } else {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erro ao executar pagamento',
          });
        }
      } catch (error: any) {
        console.error('[Payments] Error executing payment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao executar pagamento',
        });
      }
    }),

  /**
   * Obter histórico de transações PayPal do usuário
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const transactions = await getPayPalTransactionsByUser(ctx.user.id);
      return {
        success: true,
        transactions: transactions.map((t: any) => ({
          id: t.paypal_transactions.id,
          orderId: t.paypal_transactions.paypalOrderId,
          amount: t.paypal_transactions.amount,
          currency: t.paypal_transactions.currency,
          status: t.paypal_transactions.status,
          payerEmail: t.paypal_transactions.payerEmail,
          createdAt: t.paypal_transactions.createdAt,
        })),
      };
    } catch (error: any) {
      console.error('[Payments] Error fetching payment history:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao buscar histórico de pagamentos',
      });
    }
  }),

  /**
   * Obter configuração do PayPal (admin)
   */
  getPayPalConfig: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Acesso negado',
      });
    }

    try {
      const config = await getPayPalConfig();
      return {
        success: true,
        config: config
          ? {
              mode: config.mode,
              email: config.email,
              isActive: config.isActive,
            }
          : null,
      };
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao buscar configuração do PayPal',
      });
    }
  }),

  /**
   * Salvar configuração do PayPal (admin)
   */
  savePayPalConfig: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        clientSecret: z.string(),
        mode: z.enum(['sandbox', 'production']),
        email: z.string().email(),
        webhookId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Acesso negado',
        });
      }

      try {
        await savePayPalConfig(input.clientId, input.clientSecret, input.mode, input.email, input.webhookId);

        // Reinicializar PayPal
        await paypalService.initializePayPal();

        return {
          success: true,
          message: 'Configuração do PayPal salva com sucesso',
        };
      } catch (error: any) {
        console.error('[Payments] Error saving PayPal config:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao salvar configuração do PayPal',
        });
      }
    }),

  // ============ Firebase Endpoints ============

  /**
   * Obter configuração do Firebase (admin)
   */
  getFirebaseConfig: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Acesso negado',
      });
    }

    try {
      const config = await getFirebaseConfig();
      return {
        success: true,
        config: config
          ? {
              projectId: config.projectId,
              clientEmail: config.clientEmail,
              isActive: config.isActive,
            }
          : null,
      };
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao buscar configuração do Firebase',
      });
    }
  }),

  /**
   * Salvar configuração do Firebase (admin)
   */
  saveFirebaseConfig: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        privateKey: z.string(),
        clientEmail: z.string().email(),
        clientId: z.string(),
        authUri: z.string().optional(),
        tokenUri: z.string().optional(),
        authProviderX509CertUrl: z.string().optional(),
        clientX509CertUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Acesso negado',
        });
      }

      try {
        await saveFirebaseConfig(
          input.projectId,
          input.privateKey,
          input.clientEmail,
          input.clientId,
          input.authUri,
          input.tokenUri,
          input.authProviderX509CertUrl,
          input.clientX509CertUrl
        );

        // Reinicializar Firebase
        await firebaseService.initializeFirebase();

        return {
          success: true,
          message: 'Configuração do Firebase salva com sucesso',
        };
      } catch (error: any) {
        console.error('[Payments] Error saving Firebase config:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao salvar configuração do Firebase',
        });
      }
    }),

  /**
   * Testar conexão Firebase
   */
  testFirebaseConnection: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Acesso negado',
      });
    }

    try {
      await firebaseService.initializeFirebase();
      return {
        success: true,
        message: 'Conexão com Firebase estabelecida com sucesso',
      };
    } catch (error: any) {
      console.error('[Payments] Error testing Firebase connection:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao conectar com Firebase: ' + error.message,
      });
    }
  }),

  /**
   * Testar conexão PayPal
   */
  testPayPalConnection: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Acesso negado',
      });
    }

    try {
      await paypalService.initializePayPal();
      const config = await paypalService.getActiveConfig();

      if (!config) {
        throw new Error('Nenhuma configuração do PayPal encontrada');
      }

      return {
        success: true,
        message: `Conexão com PayPal estabelecida (Modo: ${config.mode})`,
        config: {
          mode: config.mode,
          email: config.email,
        },
      };
    } catch (error: any) {
      console.error('[Payments] Error testing PayPal connection:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao conectar com PayPal: ' + error.message,
      });
    }
  }),
});
