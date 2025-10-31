import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { notificationService } from "../services/notification.service";

export const alertsRouter = router({
  /**
   * Listar alertas fixos disponíveis
   */
  getFixedAlerts: publicProcedure.query(async () => {
    try {
      const alerts = await db.getFixedAlerts();
      if (alerts.length === 0) {
        // Seed com alertas padrão se não existirem
        await db.seedFixedAlerts();
        return await db.getFixedAlerts();
      }
      return alerts;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar alertas fixos",
      });
    }
  }),

  /**
   * Enviar alerta fixo para um veículo
   */
  sendFixed: protectedProcedure
    .input(z.object({
      plate: z.string().min(1, "Placa é obrigatória"),
      fixedAlertId: z.number().min(1, "ID do alerta é obrigatório"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Buscar veículo pela placa
        const vehicle = await db.getVehicleByPlate(input.plate);
        if (!vehicle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Veículo não encontrado",
          });
        }

        // Buscar alerta fixo
        const fixedAlerts = await db.getFixedAlerts();
        const fixedAlert = fixedAlerts.find(a => a.id === input.fixedAlertId);
        if (!fixedAlert) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Alerta não encontrado",
          });
        }

        // Criar alerta
        const alert = await db.sendAlert({
          vehicleId: vehicle.id,
          senderId: ctx.user.id,
          fixedAlertId: input.fixedAlertId,
          messageType: "fixed",
        });

        // Log de auditoria
        await db.logAudit({
          userId: ctx.user.id,
          action: "send_alert",
          resourceType: "alert",
          resourceId: alert.id,
          details: JSON.stringify({ plate: input.plate, fixedAlertId: input.fixedAlertId }),
          ipAddress: ctx.req.ip,
        });

        // Enviar notificações para proprietários e usuários secundários
        await notificationService.sendAlertToVehicleUsers(
          vehicle.id,
          input.plate,
          fixedAlert.title,
          fixedAlert.message.replace('{{PLATE}}', input.plate)
        );

        return alert;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar alerta",
        });
      }
    }),

  /**
   * Enviar alerta personalizado (requer créditos)
   */
  sendPersonalized: protectedProcedure
    .input(z.object({
      plate: z.string().min(1, "Placa é obrigatória"),
      message: z.string().min(1, "Mensagem é obrigatória").max(500, "Mensagem muito longa"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Buscar veículo pela placa
        const vehicle = await db.getVehicleByPlate(input.plate);
        if (!vehicle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Veículo não encontrado",
          });
        }

        // Verificar créditos (1 crédito por mensagem personalizada)
        const credits = await db.getUserCredits(ctx.user.id);
        if (!credits || credits.balance < 1) {
          throw new TRPCError({
            code: "PAYMENT_REQUIRED",
            message: "Saldo de créditos insuficiente",
          });
        }

        // Deduzir créditos
        const deducted = await db.deductCredits(ctx.user.id, 1, "Envio de alerta personalizado");
        if (!deducted) {
          throw new TRPCError({
            code: "PAYMENT_REQUIRED",
            message: "Erro ao deduzir créditos",
          });
        }

        // Criar alerta
        const alert = await db.sendAlert({
          vehicleId: vehicle.id,
          senderId: ctx.user.id,
          messageType: "personalized",
          customMessage: input.message,
          creditsUsed: 1,
        });

        // Log de auditoria
        await db.logAudit({
          userId: ctx.user.id,
          action: "send_personalized_alert",
          resourceType: "alert",
          resourceId: alert.id,
          details: JSON.stringify({ plate: input.plate, messageLength: input.message.length }),
          ipAddress: ctx.req.ip,
        });

        // Enviar notificações para proprietários e usuários secundários
        await notificationService.sendAlertToVehicleUsers(
          vehicle.id,
          input.plate,
          "Alerta Personalizado",
          input.message
        );

        return alert;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar alerta personalizado",
        });
      }
    }),

  /**
   * Listar alertas recebidos (como proprietário)
   */
  getReceived: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Buscar todos os veículos do usuário
        const vehicles = await db.getUserVehicles(ctx.user.id);
        const vehicleIds = vehicles.map(v => v.id);

        // Buscar alertas de todos os veículos
        const allAlerts = await Promise.all(
          vehicleIds.map(id => db.getAlertsByVehicle(id, input.limit))
        );

        // Combinar e ordenar por data
        const alerts = allAlerts
          .flat()
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
          .slice(0, input.limit);

        return alerts;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar alertas recebidos",
        });
      }
    }),

  /**
   * Listar alertas enviados
   */
  getSent: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // TODO: Implementar busca de alertas enviados pelo usuário
        return [];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar alertas enviados",
        });
      }
    }),
});
