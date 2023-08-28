import dotenv from "dotenv";
import durakGameSocketHandler from "./module/DurakGame/socket/DurakGameSocket.handler";
import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifySocketIo from "fastify-socket.io";
import { type SessionStore, fastifySession } from "@fastify/session";
import fastifyHelmet from "@fastify/helmet";
import fastifyStatic from "@fastify/static";
import pretty from "pino-pretty";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import getUserProfile from "./api/profile/[personalLink].get";
import indexPage from "./indexPage";
import chatPlugin from "./module/Chat/chatPlugin";
import { z } from "zod";
import { parseEnv } from "znv";
import path from "node:path";
import crypto from "node:crypto";
import gameLobbiesPlugin from "./module/Lobbies/lobbies.namespace";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import getMe from "./api/me";
import DurakGamesStore from "./DurakGamesStore";
import { Server } from "socket.io";
import { parse } from "node:querystring";
import { instrument } from "@socket.io/admin-ui";
import { DurakGameSocket } from "@durak-game/durak-dts";

dotenv.config();
// TODO remove process.env from codebase
export const env = parseEnv(process.env, {
  DATABASE_URL: z.string(),
  FASTIFY_PORT: z.number().default(3000),
  CORS_ORIGIN: z
    .array(z.string())
    .default([
      "https://admin.socket.io",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ]),
  SESSION_SECRET: z
    .string()
    .default(crypto.randomBytes(64).toString("base64url")),
  SESSION_COOKIE_NAME: z.string().default("sessionId"),
  IS_SESSION_SECURE: z.boolean().default(false),
  SESSION_MAX_AGE: z.number().default(864000000 /* 10 days */),
  SESSION_STORE_CHECK_PERIOD: z.number().default(600000 /* 10 minutes */),
});

const fastify = Fastify({
  logger: {
    stream: pretty({ colorize: true }),
  },
}).withTypeProvider<ZodTypeProvider>();
export type SingletonFastifyInstance = typeof fastify;

export const durakGamesStore = new DurakGamesStore();
export const store: SessionStore = new PrismaSessionStore(new PrismaClient(), {
  checkPeriod: env.SESSION_STORE_CHECK_PERIOD,
  loggerLevel: ["log", "warn", "error"],
});

fastify
  .decorate("prisma", new PrismaClient())
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .register(fastifyStatic, { root: path.join(__dirname, "../static") })
  .register(fastifyCors, { origin: [...env.CORS_ORIGIN] })
  .register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        connectSrc: [
          "'self'",
          "http://127.0.0.1:3001",
          "ws://127.0.0.1:3001",
          "http://127.0.0.1:3000",
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
  .register(fastifySocketIo, {
    cors: {
      origin: [...env.CORS_ORIGIN],
    },
  })
  .register(fastifyWebsocket, {
    options: {
      verifyClient: async function (_info: unknown) {
        // (info.req as FastifyRequest);
      },
    },
  })
  // TODO rework plugins which are commented (because they are does not work properly)
  // .register(VkAuth)
  // .register(GithubAuth)
  .register(indexPage)
  .register(getMe)
  .register(getUserProfile)
  .register(chatPlugin, { path: "/global-chat" })
  .register(gameLobbiesPlugin)
  .setNotFoundHandler(async function (this: typeof fastify, _request, reply) {
    this.log.error("setNotFoundHandler before");
    return reply.type("text/html").sendFile("index.html");
  })
  .ready()
  .then(function (this: typeof fastify) {}.bind(fastify));

(async () => {
  try {
    await fastify.listen({ port: env.FASTIFY_PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();

export function raise(err: Error | string = new Error()): never {
  throw typeof err === "string" ? new Error(err) : err;
}
const io = new Server(3001, {
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
function mutateSocketData(
  socket: DurakGameSocket.Socket,
  next: (err?: Error) => void,
) {
  const sid = getSid(socket, next, console);
  if (!sid) return next();
  store.get(sid, (error, session) => {
    if (error || !session) {
      console.log(
        {
          error,
          session,
        },
        "store couldn't get session data",
      );
      return next();
    }
    socket.data.sid = sid;
    socket.data.user = session.user;
    return next();
  });
}

function getSid(
  socket: DurakGameSocket.Socket,
  next: (err?: Error) => void,
  logger?: { log: Function },
) {
  if (!socket.handshake.headers.cookie) return next();
  const cookie = parse(socket.handshake.headers.cookie);
  logger?.log({ cookie });
  const sessionId = cookie["sessionId"];
  logger?.log({ sessionId });
  if (!sessionId || Array.isArray(sessionId)) return next();
  const sid = sessionId.split(".")[0];
  logger?.log({ sid });
  return sid;
}

gamesNamespace.on("connection", durakGameSocketHandler);
instrument(io, { auth: false, mode: "development" });
