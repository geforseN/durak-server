import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import type { SessionStore } from "@fastify/session";

import { getParsedEnv } from "@/config/zod-env.js";
import { prisma } from "@/shared/prisma.js";

export const env = getParsedEnv(process.env);

export const sessionStore = new PrismaSessionStore(prisma, {
  checkPeriod: env.SESSION_STORE_CHECK_PERIOD,
  loggerLevel: ["log", "warn", "error"],
}) satisfies SessionStore;

export { createSocketIoServer } from "./socket-io.js";
