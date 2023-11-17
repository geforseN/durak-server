import type { SessionStore } from "@fastify/session";
import { PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import { createFastify, createSocketIoServer, env } from "./config/index.js";

export const sessionStore: SessionStore = new PrismaSessionStore(new PrismaClient(), {
  checkPeriod: env.SESSION_STORE_CHECK_PERIOD,
  loggerLevel: ["log", "warn", "error"],
});

main();

async function main() {
  let fastify: Awaited<ReturnType<typeof createFastify>> | undefined;
  try {
    fastify = createFastify(env, sessionStore);
    const { BasePlayer } = await import(
      "./module/DurakGame/entity/Player/BasePlayer.abstract.js"
    );
    BasePlayer.configureDependencies();
    createSocketIoServer(env, sessionStore);
    await fastify.listen({ port: env.FASTIFY_PORT });
  } catch (err) {
    fastify?.log.error(err);
    process.exit(1);
  }
}
