import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const creditsRouter = router({
  /**
   * Obter saldo de créditos do usuário
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      let credits = await db.getUserCredits(ctx.user.id);
      if (!credits) {
        credits = await db.initializeUserCredits(ctx.user.id);
      }
      return { balance: credits.balance };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao obter saldo de créditos",
      });
    }
  }),

  /**
   * Comprar créditos
   */
  purchase: protectedProcedure
    .input(z.object({
      amount: z.number().min(1, "Quantidade mínima é 1 crédito").max(1000, "Quantidade máxima é 1000 créditos"),
      paymentMethod: z.enum(["stripe", "paypal"]),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Integrar com gateway de pagamento (Stripe/PayPal)
        // Por enquanto, simular compra bem-sucedida

        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        await db.addCredits(
          ctx.user.id,
          input.amount,
          `Compra de ${input.amount} créditos`,
          input.paymentMethod,
          transactionId
        );

        // Log de auditoria
        await db.logAudit({
          userId: ctx.user.id,
          action: "purchase_credits",
          resourceType: "credits",
          details: JSON.stringify({ amount: input.amount, paymentMethod: input.paymentMethod }),
          ipAddress: ctx.req.ip,
        });

        const credits = await db.getUserCredits(ctx.user.id);
        return { balance: credits!.balance, transactionId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao comprar créditos",
        });
      }
    }),

  /**
   * Listar histórico de transações
   */
  getTransactions: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // TODO: Implementar busca de transações do usuário
        return [];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar transações",
        });
      }
    }),
});
