import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { vehiclesRouter } from "./routers/vehicles";
import { alertsRouter } from "./routers/alerts";
import { creditsRouter } from "./routers/credits";
import { notificationsRouter } from "./routers/notifications";
import { authRouter } from "./routers/auth";
import { messagesRouter } from "./routers/messages";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,

  vehicles: vehiclesRouter,
  alerts: alertsRouter,
  credits: creditsRouter,
  notifications: notificationsRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
