import { instrument } from "@socket.io/admin-ui";
import dotenv from "dotenv";
import serverOptions from "./server.options";
import durakGameSocketHandler from "./module/DurakGame/socket/DurakGameSocket.handler";
import DurakGame from "./module/DurakGame/DurakGame.implimetntation";
import beforeConnectMiddleware from "./namespaces/on-connect.middleware";
import { DurakGameSocket } from "./module/DurakGame/socket/DurakGameSocket.types";
import Fastify from "fastify";
import fastifySession from "@fastify/session";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifySocketIo from "fastify-socket.io";
import pretty from "pino-pretty";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import GithubAuth from "./api/auth/github";
import VkAuth from "./api/auth/vk";
import getUserProfile from "./api/profile/[personalLink].get";
import onConnection from "./onConnection";
import chatPlugin from "./module/Chat/chatPlugin";

dotenv.config();
const ONE_MINUTE_IN_MS = 60 * 1000;
const TEN_MINUTES_IN_MS = ONE_MINUTE_IN_MS * 10;
const TEN_DAYS_IN_MS = ONE_MINUTE_IN_MS * 60 * 24 * 10;
export const durakGames = new Map<string, DurakGame>();
const fastify = Fastify({
  logger: {
    stream: pretty({ colorize: true }),
  },
});

export const store = new PrismaSessionStore(new PrismaClient(), {
  checkPeriod: TEN_MINUTES_IN_MS,
  loggerLevel: "log",
});

fastify
  .register(fastifyCors, { origin: [serverOptions.cors.origin] })
  .register(fastifyCookie)
  .register(fastifySession, {
    secret: process.env.EXPRESS_PRISMA_SESSION_SECRET_KEY!,
    cookie: { secure: false, sameSite: "lax", maxAge: TEN_DAYS_IN_MS },
    store: store as any,
  })
  .register(fastifySocketIo, {
    cors: {
      origin: serverOptions.cors.origin,
    },
  })
  .register(fastifyWebsocket, {
    options: {
      verifyClient: async function(info: any) {
        // (info.req as FastifyRequest);
      },
    },
  })
  .register(VkAuth)
  .register(GithubAuth)
  .register(onConnection)
  .register(getUserProfile)
  .register(chatPlugin, { path: "/global-chat" })
  .ready()
  .then(function() {
    // @ts-ignore
    fastify.log.info(this);
    instrument(fastify.io, { auth: false, mode: "development" });
    const durakGame: DurakGameSocket.Namespace = fastify.io.of(
      /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    );
    durakGame.use(beforeConnectMiddleware);
    durakGame.on("connect", durakGameSocketHandler.bind(durakGame));
    return fastify.log.info(fastify.io.path());
  });

;(async () => {
  try {
    await fastify.listen({ port: Number(process.env.FASTIFY_PORT) });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
