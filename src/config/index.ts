import "dotenv/config";
import path from "path";

import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import type { SessionStore } from "@fastify/session";

import { getParsedEnv } from "./zod-env.js";
import { prisma } from "./prisma.js";

export const env = getParsedEnv(process.env);

export const sessionStore = new PrismaSessionStore(prisma, {
  checkPeriod: env.SESSION_STORE_CHECK_PERIOD,
  loggerLevel: ["log", "warn", "error"],
}) satisfies SessionStore;

export { createFastify, type FastifyInstanceT } from "./fastify.js";
export { createSocketIoServer } from "./socket-io.js";
export { prisma };
