import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import type { SessionStore } from "@fastify/session";
import { prisma } from "@/shared/prisma.js";
import { storeConfig } from "@/config/session.config.js";

export const sessionStore = new PrismaSessionStore(
  prisma,
  storeConfig,
) satisfies SessionStore;
