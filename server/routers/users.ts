import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { validatePhone } from "../utils/validators";

export const usersRouter = router({
  /**
   * Obter dados do usuário autenticado
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Banco de dados não disponível",
      });
    }

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      const userData = user[0];
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        cnpj: userData.cnpj,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
    } catch (error) {
      console.error("Erro ao obter perfil:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao obter perfil",
      });
    }
  }),

  /**
   * Atualizar dados do usuário
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
        cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos"),
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

      // Validar telefone
      if (!validatePhone(input.phone)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Telefone inválido",
        });
      }

      try {
        await db
          .update(users)
          .set({
            name: input.name,
            phone: input.phone,
            cnpj: input.cnpj,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: "Perfil atualizado com sucesso",
        };
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar perfil",
        });
      }
    }),

  /**
   * Alterar senha
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
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
        // Buscar usuário
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (userResult.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        const user = userResult[0];

        // Verificar senha atual
        if (!user.passwordHash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não tem senha definida",
          });
        }

        const isPasswordValid = await bcrypt.compare(
          input.currentPassword,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha atual incorreta",
          });
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(input.newPassword, salt);

        // Atualizar senha
        await db
          .update(users)
          .set({
            passwordHash: hashedPassword,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: "Senha alterada com sucesso",
        };
      } catch (error) {
        console.error("Erro ao alterar senha:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao alterar senha",
        });
      }
    }),

  /**
   * Deletar conta do usuário
   */
  deleteAccount: protectedProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Buscar usuário
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (userResult.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        const user = userResult[0];

        // Verificar senha
        if (!user.passwordHash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não tem senha definida",
          });
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha incorreta",
          });
        }

        // Deletar usuário (soft delete - marcar como inativo)
        await db
          .update(users)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: "Conta deletada com sucesso",
        };
      } catch (error) {
        console.error("Erro ao deletar conta:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar conta",
        });
      }
    }),
});
