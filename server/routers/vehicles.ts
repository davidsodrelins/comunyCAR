import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const vehiclesRouter = router({
  /**
   * Cadastrar novo veículo
   */
  create: protectedProcedure
    .input(z.object({
      plate: z.string().min(1, "Placa é obrigatória"),
      brand: z.string().min(1, "Marca é obrigatória"),
      model: z.string().min(1, "Modelo é obrigatório"),
      color: z.string().optional(),
      year: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Validar se placa já existe
        const existing = await db.getVehicleByPlate(input.plate);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Veículo com esta placa já está cadastrado",
          });
        }

        const vehicle = await db.createVehicle(input);

        // Vincular usuário como proprietário
        await db.linkUserToVehicle(ctx.user.id, vehicle.id, "owner");

        // Log de auditoria
        await db.logAudit({
          userId: ctx.user.id,
          action: "create_vehicle",
          resourceType: "vehicle",
          resourceId: vehicle.id,
          ipAddress: ctx.req.ip,
        });

        return vehicle;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao cadastrar veículo",
        });
      }
    }),

  /**
   * Listar veículos do usuário
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const vehicles = await db.getUserVehicles(ctx.user.id);
      return vehicles;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar veículos",
      });
    }
  }),

  /**
   * Buscar veículo por placa
   */
  getByPlate: publicProcedure
    .input(z.object({
      plate: z.string().min(1, "Placa é obrigatória"),
    }))
    .query(async ({ input }) => {
      try {
        const vehicle = await db.getVehicleByPlate(input.plate);
        if (!vehicle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Veículo não encontrado",
          });
        }
        return vehicle;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar veículo",
        });
      }
    }),

  /**
   * Adicionar usuário secundário a um veículo
   */
  addSecondaryUser: protectedProcedure
    .input(z.object({
      vehicleId: z.number(),
      userEmail: z.string().email("Email inválido"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar se o usuário é proprietário do veículo
        const vehicles = await db.getUserVehicles(ctx.user.id);
        const vehicle = vehicles.find(v => v.id === input.vehicleId);
        if (!vehicle) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para adicionar usuários a este veículo",
          });
        }

        // TODO: Buscar usuário por email e vincular
        // Por enquanto, retornar erro
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Funcionalidade em desenvolvimento",
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao adicionar usuário secundário",
        });
      }
    }),

  /**
   * Listar usuários de um veículo
   */
  getUsers: protectedProcedure
    .input(z.object({
      vehicleId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar se o usuário tem acesso ao veículo
        const vehicles = await db.getUserVehicles(ctx.user.id);
        const vehicle = vehicles.find(v => v.id === input.vehicleId);
        if (!vehicle) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para acessar este veículo",
          });
        }

        const users = await db.getVehicleUsers(input.vehicleId);
        return users.map(u => ({
          id: u.user.id,
          name: u.user.name,
          email: u.user.email,
          role: u.role,
        }));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar usuários do veículo",
        });
      }
    }),
});
