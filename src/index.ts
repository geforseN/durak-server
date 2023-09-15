import durakGameSocketHandler from "./module/DurakGame/socket/DurakGameSocket.handler.js";
import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import { type SessionStore, fastifySession } from "@fastify/session";
import fastifyHelmet from "@fastify/helmet";
import fastifyStatic from "@fastify/static";
import pretty from "pino-pretty";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import getUserProfile from "./api/profile/[personalLink].get.js";
import indexPage from "./indexPage.js";
import chatPlugin from "./module/Chat/chatPlugin.js";
import gameLobbiesPlugin from "./module/Lobbies/lobbies.plugin.js";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import getMe from "./api/me.js";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { DurakGameSocket } from "@durak-game/durak-dts";
import { env, pathForStatic } from "./config/index.js";
import { mutateSocketData } from "./module/DurakGame/socket/mutateSocketData.js";

const fastify = Fastify({
  logger: {
    stream: pretty({ colorize: true }),
  },
}).withTypeProvider<ZodTypeProvider>();
export type SingletonFastifyInstance = typeof fastify;

const local = "http://localhost:3000/";

export const store: SessionStore = new PrismaSessionStore(new PrismaClient(), {
  checkPeriod: env.SESSION_STORE_CHECK_PERIOD,
  loggerLevel: ["log", "warn", "error"],
});

fastify
  .decorate("prisma", new PrismaClient())
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .register(fastifyStatic, { root: pathForStatic })
  .register(fastifyCors, { origin: [...env.CORS_ORIGIN] })
  .register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        connectSrc: [
          "'self'",
          "http://127.0.0.1:3001",
          "ws://127.0.0.1:3001",
          "http://127.0.0.1:3000",
          local,
          local.replace('3000', '5173')
        ],
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "https://xsgames.co/randomusers/assets/avatars/pixel/",
          "https://cdn.7tv.app/emote/6306876cbe8c19d70f9d6b22/4x.webp",
          "https://deckofcardsapi.com/static/img/",
        ],
      },
    },
  })
  .register(fastifyCookie)
  .register(fastifySession, {
    cookieName: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    cookie: {
      domain: "localhost",
      secure: env.IS_SESSION_SECURE,
      sameSite: "lax",
      maxAge: env.SESSION_MAX_AGE,
    },
    saveUninitialized: false,
    store,
  })
  .register(fastifyWebsocket, {
    options: {
      verifyClient: async function (_info: unknown) {
        // (info.req as FastifyRequest);
      },
    },
  })
  .register(indexPage)
  .register(getMe)
  .register(getUserProfile)
  .register(chatPlugin, { path: "/global-chat" })
  .register(gameLobbiesPlugin)
  .setNotFoundHandler(async function (this: typeof fastify, _, reply) {
    this.log.error("setNotFoundHandler");
    return reply.type("text/html").sendFile("index.html");
  })
  .ready()
  .then(function (this: typeof fastify) {}.bind(fastify));

(async () => {
  try {
    await import(
      "./module/DurakGame/entity/Player/BasePlayer.abstract.js"
    ).then(({ BasePlayer }) => BasePlayer.configureDependencies());
    await fastify.listen({ port: env.FASTIFY_PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();

const io = new Server(env.SOCKET_IO_PORT, {
  cors: {
    origin: [
      ...env.CORS_ORIGIN,
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  },
});
const gamesNamespace: DurakGameSocket.Namespace = io.of(
  /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
);
gamesNamespace.use(mutateSocketData);
gamesNamespace.on("connection", durakGameSocketHandler);
instrument(io, { auth: false, mode: "development" });
