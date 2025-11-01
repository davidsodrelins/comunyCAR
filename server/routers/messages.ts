import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { messages, messageReactions, messageRecipients, vehicles, vehicleUsers, users, fixedAlerts } from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendEmail } from "../services/email.service";
import { sendNotification } from "../services/notification.service";

export const messagesRouter = router({
  /**
   * Listar mensagens recebidas
   */
  getReceived: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Buscar mensagens onde o usuário é destinatário
        const receivedMessages = await db
          .select({
            id: messages.id,
            senderId: messages.senderId,
            senderName: users.name,
            vehicleId: messages.vehicleId,
            vehiclePlate: vehicles.plate,
            messageType: messages.messageType,
            messageContent: messages.messageContent,
            fixedAlertTitle: fixedAlerts.titulo,
            status: messages.status,
            createdAt: messages.createdAt,
            readAt: messageRecipients.readAt,
          })
          .from(messages)
          .innerJoin(messageRecipients, eq(messageRecipients.messageId, messages.id))
          .innerJoin(users, eq(users.id, messages.senderId))
          .innerJoin(vehicles, eq(vehicles.id, messages.vehicleId))
          .leftJoin(fixedAlerts, eq(fixedAlerts.id, messages.fixedAlertId))
          .where(eq(messageRecipients.recipientId, ctx.user.id))
          .orderBy(desc(messages.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        // Buscar reações para cada mensagem
        const messagesWithReactions = await Promise.all(
          receivedMessages.map(async (msg) => {
            const reactions = await db
              .select({
                reactionType: messageReactions.reactionType,
                userName: users.name,
                userId: messageReactions.userId,
              })
              .from(messageReactions)
              .innerJoin(users, eq(users.id, messageReactions.userId))
              .where(eq(messageReactions.messageId, msg.id));

            return {
              ...msg,
              reactions: reactions.reduce((acc, r) => {
                if (!acc[r.reactionType]) {
                  acc[r.reactionType] = [];
                }
                acc[r.reactionType].push({
                  userName: r.userName,
                  userId: r.userId,
                });
                return acc;
              }, {} as Record<string, Array<{ userName: string | null; userId: number }>>),
            };
          })
        );

        return messagesWithReactions;
      } catch (error) {
        console.error("Erro ao buscar mensagens recebidas:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar mensagens",
        });
      }
    }),

  /**
   * Listar mensagens enviadas
   */
  getSent: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Buscar mensagens enviadas pelo usuário
        const sentMessages = await db
          .select({
            id: messages.id,
            vehicleId: messages.vehicleId,
            vehiclePlate: vehicles.plate,
            messageType: messages.messageType,
            messageContent: messages.messageContent,
            fixedAlertTitle: fixedAlerts.titulo,
            status: messages.status,
            createdAt: messages.createdAt,
          })
          .from(messages)
          .innerJoin(vehicles, eq(vehicles.id, messages.vehicleId))
          .leftJoin(fixedAlerts, eq(fixedAlerts.id, messages.fixedAlertId))
          .where(eq(messages.senderId, ctx.user.id))
          .orderBy(desc(messages.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        // Buscar destinatários e reações para cada mensagem
        const messagesWithDetails = await Promise.all(
          sentMessages.map(async (msg) => {
            const recipients = await db
              .select({
                recipientId: messageRecipients.recipientId,
                recipientName: users.name,
                readAt: messageRecipients.readAt,
              })
              .from(messageRecipients)
              .innerJoin(users, eq(users.id, messageRecipients.recipientId))
              .where(eq(messageRecipients.messageId, msg.id));

            const reactions = await db
              .select({
                reactionType: messageReactions.reactionType,
                userName: users.name,
                userId: messageReactions.userId,
              })
              .from(messageReactions)
              .innerJoin(users, eq(users.id, messageReactions.userId))
              .where(eq(messageReactions.messageId, msg.id));

            return {
              ...msg,
              recipients: recipients,
              reactions: reactions.reduce((acc, r) => {
                if (!acc[r.reactionType]) {
                  acc[r.reactionType] = [];
                }
                acc[r.reactionType].push({
                  userName: r.userName,
                  userId: r.userId,
                });
                return acc;
              }, {} as Record<string, Array<{ userName: string | null; userId: number }>>),
            };
          })
        );

        return messagesWithDetails;
      } catch (error) {
        console.error("Erro ao buscar mensagens enviadas:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar mensagens",
        });
      }
    }),

  /**
   * Enviar reação a uma mensagem
   */
  addReaction: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
        reactionType: z.enum(["seen", "thank_you", "urgent", "resolved", "vehicle", "later"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Verificar se a mensagem existe
        const msg = await db
          .select()
          .from(messages)
          .where(eq(messages.id, input.messageId))
          .limit(1);

        if (msg.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Mensagem não encontrada",
          });
        }

        // Verificar se o usuário é destinatário
        const recipient = await db
          .select()
          .from(messageRecipients)
          .where(
            and(
              eq(messageRecipients.messageId, input.messageId),
              eq(messageRecipients.recipientId, ctx.user.id)
            )
          )
          .limit(1);

        if (recipient.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não é destinatário desta mensagem",
          });
        }

        // Verificar se já existe reação deste usuário
        const existingReaction = await db
          .select()
          .from(messageReactions)
          .where(
            and(
              eq(messageReactions.messageId, input.messageId),
              eq(messageReactions.userId, ctx.user.id),
              eq(messageReactions.reactionType, input.reactionType)
            )
          )
          .limit(1);

        if (existingReaction.length > 0) {
          // Remover reação
          await db
            .delete(messageReactions)
            .where(
              and(
                eq(messageReactions.messageId, input.messageId),
                eq(messageReactions.userId, ctx.user.id),
                eq(messageReactions.reactionType, input.reactionType)
              )
            );

          return {
            success: true,
            message: "Reação removida",
            action: "removed",
          };
        } else {
          // Adicionar reação
          await db.insert(messageReactions).values({
            messageId: input.messageId,
            userId: ctx.user.id,
            reactionType: input.reactionType,
            createdAt: new Date(),
          });

          // Se for "seen", marcar como lido
          if (input.reactionType === "seen") {
            await db
              .update(messageRecipients)
              .set({ readAt: new Date() })
              .where(
                and(
                  eq(messageRecipients.messageId, input.messageId),
                  eq(messageRecipients.recipientId, ctx.user.id)
                )
              );

            // Atualizar status da mensagem
            await db
              .update(messages)
              .set({ status: "read", readAt: new Date() })
              .where(eq(messages.id, input.messageId));
          }

          return {
            success: true,
            message: "Reação adicionada",
            action: "added",
          };
        }
      } catch (error) {
        console.error("Erro ao adicionar reação:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao adicionar reação",
        });
      }
    }),

  /**
   * Obter detalhes de uma mensagem com todas as reações
   */
  getMessageDetails: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Buscar mensagem
        const msg = await db
          .select()
          .from(messages)
          .where(eq(messages.id, input.messageId))
          .limit(1);

        if (msg.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Mensagem não encontrada",
          });
        }

        const message = msg[0];

        // Verificar permissão (remetente ou destinatário)
        if (message.senderId !== ctx.user.id) {
          const recipient = await db
            .select()
            .from(messageRecipients)
            .where(
              and(
                eq(messageRecipients.messageId, input.messageId),
                eq(messageRecipients.recipientId, ctx.user.id)
              )
            )
            .limit(1);

          if (recipient.length === 0) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Você não tem permissão para ver esta mensagem",
            });
          }
        }

        // Buscar reações
        const reactions = await db
          .select({
            reactionType: messageReactions.reactionType,
            userName: users.name,
            userId: messageReactions.userId,
            createdAt: messageReactions.createdAt,
          })
          .from(messageReactions)
          .innerJoin(users, eq(users.id, messageReactions.userId))
          .where(eq(messageReactions.messageId, input.messageId))
          .orderBy(desc(messageReactions.createdAt));

        return {
          ...message,
          reactions: reactions,
        };
      } catch (error) {
        console.error("Erro ao buscar detalhes da mensagem:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar detalhes",
        });
      }
    }),
});
