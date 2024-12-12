import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import type { SessionStore } from "@fastify/session";
import { prisma } from "@/shared/prisma.js";
import { parseStoreConfig } from "@/config/session-store.config.js";

export const sessionStore = new PrismaSessionStore(
  prisma,
  parseStoreConfig(process.env),
) satisfies SessionStore;
