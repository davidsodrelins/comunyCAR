import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  /**
   * Obter preferências de notificação do usuário
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      let prefs = await db.getNotificationPreferences(ctx.user.id);
      if (!prefs) {
        prefs = await db.initializeNotificationPreferences(ctx.user.id);
      }
      return prefs;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao obter preferências de notificação",
      });
    }
  }),

  /**
   * Atualizar preferências de notificação
   */
  updatePreferences: protectedProcedure
    .input(z.object({
      emailEnabled: z.boolean().optional(),
      whatsappEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const prefs = await db.updateNotificationPreferences(ctx.user.id, input);

        // Log de auditoria
        await db.logAudit({
          userId: ctx.user.id,
          action: "update_notification_preferences",
          resourceType: "notification_preferences",
          details: JSON.stringify(input),
          ipAddress: ctx.req.ip,
        });

        return prefs;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar preferências de notificação",
        });
      }
    }),

  /**
   * Registrar token de push (Firebase Cloud Messaging)
   */
  registerPushToken: protectedProcedure
    .input(z.object({
      token: z.string().min(1, "Token é obrigatório"),
      platform: z.enum(["android", "ios", "web"]),
      deviceName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const pushToken = await db.addPushToken(
          ctx.user.id,
          input.token,
          input.platform,
          input.deviceName
        );

        // Log de auditoria
        await db.logAudit({
          userId: ctx.user.id,
          action: "register_push_token",
          resourceType: "push_token",
          resourceId: pushToken.id,
          details: JSON.stringify({ platform: input.platform }),
          ipAddress: ctx.req.ip,
        });

        return pushToken;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao registrar token de push",
        });
      }
    }),

  /**
   * Listar tokens de push do usuário
   */
  getPushTokens: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tokens = await db.getUserPushTokens(ctx.user.id);
      return tokens.map(t => ({
        id: t.id,
        platform: t.platform,
        deviceName: t.deviceName,
        createdAt: t.createdAt,
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar tokens de push",
      });
    }
  }),

  /**
   * Conectar WhatsApp (gerar QR code)
   */
  connectWhatsapp: protectedProcedure
    .input(z.object({
      phoneNumber: z.string().min(1, "Número de telefone é obrigatório"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar se já existe configuração
        let config = await db.getWhatsappConfig(ctx.user.id);
        if (!config) {
          config = await db.createWhatsappConfig(ctx.user.id, input.phoneNumber);
        }

        // TODO: Integrar com whatsapp-web.js para gerar QR code
        // Por enquanto, retornar status de conexão

        return {
          id: config.id,
          status: config.status,
          phoneNumber: config.phoneNumber,
          qrCode: config.qrCode, // Será preenchido pela integração
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao conectar WhatsApp",
        });
      }
    }),

  /**
   * Desconectar WhatsApp
   */
  disconnectWhatsapp: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const config = await db.getWhatsappConfig(ctx.user.id);
      if (!config) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "WhatsApp não está conectado",
        });
      }

      // TODO: Integrar com whatsapp-web.js para desconectar
      await db.updateWhatsappConfig(config.id, { status: "disconnected" });

      // Log de auditoria
      await db.logAudit({
        userId: ctx.user.id,
        action: "disconnect_whatsapp",
        resourceType: "whatsapp_config",
        resourceId: config.id,
        ipAddress: ctx.req.ip,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao desconectar WhatsApp",
      });
    }
  }),

  /**
   * Obter status de conexão WhatsApp
   */
  getWhatsappStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const config = await db.getWhatsappConfig(ctx.user.id);
      if (!config) {
        return { connected: false, status: "disconnected" };
      }

      return {
        connected: config.status === "connected",
        status: config.status,
        phoneNumber: config.phoneNumber,
        lastConnectedAt: config.lastConnectedAt,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao obter status do WhatsApp",
      });
    }
  }),
});
