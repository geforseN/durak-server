import type { SessionStore } from "@fastify/session";
import { DurakGameSocket } from "@durak-game/durak-dts";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import { fastifySession } from "@fastify/session";
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import { PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { instrument } from "@socket.io/admin-ui";
import Fastify from "fastify";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import PinoPretty from "pino-pretty";
import getMe from "./api/me.js";
import getUserProfile from "./api/profile/[personalLink].get.js";
import { env, pathForStatic } from "./config/index.js";
import indexPage from "./indexPage.js";
import chatPlugin from "./module/Chat/chatPlugin.js";
import durakGameSocketHandler from "./module/DurakGame/socket/DurakGameSocket.handler.js";
import { mutateSocketData } from "./module/DurakGame/socket/mutateSocketData.js";
import gameLobbiesPlugin from "./module/Lobbies/lobbies.plugin.js";
import { Server } from "socket.io";

const fastify = Fastify({
  logger: {
    stream: PinoPretty({ colorize: true }),
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
          local.replace("3000", "5173"),
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
    cookie: {
      domain: "localhost",
      maxAge: env.SESSION_MAX_AGE,
      sameSite: "lax",
      secure: env.IS_SESSION_SECURE,
    },
    cookieName: env.SESSION_COOKIE_NAME,
    saveUninitialized: false,
    secret: env.SESSION_SECRET,
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
    credentials: true,
    origin: [
      ...env.CORS_ORIGIN,
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3000",
    ],
  },
});
const gamesNamespace: DurakGameSocket.Namespace = io.of(
  /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
);
gamesNamespace.use(mutateSocketData);
gamesNamespace.on("connection", durakGameSocketHandler);
instrument(io, { auth: false, mode: "development" });
