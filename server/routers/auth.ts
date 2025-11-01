import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, emailVerificationTokens, passwordResetTokens } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendEmail } from "../services/email.service";
import { validateCNPJ, validateEmail, validatePhone } from "../utils/validators";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

/**
 * Gera um token aleatório de 32 caracteres
 */
function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Calcula hash de uma senha
 */
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara senha com hash
 */
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const authRouter = router({
  /**
   * Registrar novo usuário
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
        cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos"),
        password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
        confirmPassword: z.string(),
      })
        .refine((data) => data.password === data.confirmPassword, {
          message: "As senhas não correspondem",
          path: ["confirmPassword"],
        })
    )
    .mutation(async ({ input }) => {
      // Validar email
      if (!validateEmail(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email inválido",
        });
      }

      // Validar CNPJ
      if (!validateCNPJ(input.cnpj)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CNPJ inválido",
        });
      }

      // Validar telefone
      if (!validatePhone(input.phone)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Telefone inválido",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      // Verificar se email já existe
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já cadastrado",
        });
      }

      // Hash da senha
      const hashedPassword = await hashPassword(input.password);

      // Gerar token de verificação de email
      const verificationToken = generateToken();
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      try {
        // Criar usuário
        await db.insert(users).values({
          email: input.email,
          name: input.name,
          phone: input.phone,
          cnpj: input.cnpj,
          passwordHash: hashedPassword,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Salvar token de verificação
        await db.insert(emailVerificationTokens).values({
          email: input.email,
          token: verificationToken,
          expiresAt: verificationTokenExpiry,
          createdAt: new Date(),
        });

        // Enviar email de verificação
        const verificationLink = `${process.env.VITE_APP_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;
        await sendEmail({
          to: input.email,
          subject: "Verifique seu email - comunyCAR",
          html: `
            <h2>Bem-vindo ao comunyCAR!</h2>
            <p>Clique no link abaixo para verificar seu email:</p>
            <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verificar Email
            </a>
            <p>Ou copie este link: ${verificationLink}</p>
            <p>Este link expira em 24 horas.</p>
          `,
        });

        return {
          success: true,
          message: "Usuário criado com sucesso. Verifique seu email para ativar a conta.",
        };
      } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao registrar usuário",
        });
      }
    }),

  /**
   * Verificar email
   */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Buscar token
        const tokenRecord = await db
          .select()
          .from(emailVerificationTokens)
          .where(eq(emailVerificationTokens.token, input.token))
          .limit(1);

        if (tokenRecord.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Token inválido",
          });
        }

        const record = tokenRecord[0];

        // Verificar se expirou
        if (new Date() > record.expiresAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token expirado",
          });
        }

        // Atualizar usuário
        await db
          .update(users)
          .set({ emailVerified: true, updatedAt: new Date() })
          .where(eq(users.email, record.email));

        // Deletar token
        await db
          .delete(emailVerificationTokens)
          .where(eq(emailVerificationTokens.token, input.token));

        return {
          success: true,
          message: "Email verificado com sucesso!",
        };
      } catch (error) {
        console.error("Erro ao verificar email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao verificar email",
        });
      }
    }),

  /**
   * Login com email e senha
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
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
        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (userRecord.length === 0) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha incorretos",
          });
        }

        const user = userRecord[0];

        // Verificar se email foi verificado
        if (!user.emailVerified) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Email não verificado. Verifique seu email para continuar.",
          });
        }

        // Comparar senhas
        if (!user.passwordHash || !(await comparePassword(input.password, user.passwordHash))) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha incorretos",
          });
        }

        // Atualizar lastSignedIn
        await db
          .update(users)
          .set({ lastSignedIn: new Date() })
          .where(eq(users.id, user.id));

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao fazer login",
        });
      }
    }),

  /**
   * Solicitar recuperação de senha
   */
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Buscar usuário
        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (userRecord.length === 0) {
          // Não revelar se o email existe
          return {
            success: true,
            message: "Se o email existe, você receberá um link para resetar a senha",
          };
        }

        const user = userRecord[0];

        // Gerar token de reset
        const resetToken = generateToken();
        const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

        // Salvar token
        await db.insert(passwordResetTokens).values({
          email: user.email,
          token: resetToken,
          expiresAt: resetTokenExpiry,
          createdAt: new Date(),
        });

        // Enviar email
        const resetLink = `${process.env.VITE_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
        await sendEmail({
          to: user.email,
          subject: "Resetar sua senha - comunyCAR",
          html: `
            <h2>Recuperação de Senha</h2>
            <p>Clique no link abaixo para resetar sua senha:</p>
            <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Resetar Senha
            </a>
            <p>Ou copie este link: ${resetLink}</p>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou isso, ignore este email.</p>
          `,
        });

        return {
          success: true,
          message: "Se o email existe, você receberá um link para resetar a senha",
        };
      } catch (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao solicitar recuperação de senha",
        });
      }
    }),

  /**
   * Resetar senha
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
        confirmPassword: z.string(),
      })
        .refine((data) => data.password === data.confirmPassword, {
          message: "As senhas não correspondem",
          path: ["confirmPassword"],
        })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Buscar token
        const tokenRecord = await db
          .select()
          .from(passwordResetTokens)
          .where(eq(passwordResetTokens.token, input.token))
          .limit(1);

        if (tokenRecord.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Token inválido",
          });
        }

        const record = tokenRecord[0];

        // Verificar se expirou
        if (new Date() > record.expiresAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token expirado",
          });
        }

        // Hash da nova senha
        const hashedPassword = await hashPassword(input.password);

        // Atualizar senha
        await db
          .update(users)
          .set({ passwordHash: hashedPassword, updatedAt: new Date() })
          .where(eq(users.email, record.email));

        // Deletar token
        await db
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.token, input.token));

        return {
          success: true,
          message: "Senha resetada com sucesso!",
        };
      } catch (error) {
        console.error("Erro ao resetar senha:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao resetar senha",
        });
      }
    }),

  /**
   * Obter dados do usuário autenticado
   */
  me: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
    };
  }),
});
