import { instrument } from "@socket.io/admin-ui";
import dotenv from "dotenv";
import durakGameSocketHandler from "./module/DurakGame/socket/DurakGameSocket.handler";
import DurakGame from "./module/DurakGame/DurakGame";
import { DurakGameSocket } from "./module/DurakGame/socket/DurakGameSocket.types";
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
import GithubAuth from "./api/auth/github";
import VkAuth from "./api/auth/vk";
import getUserProfile from "./api/profile/[personalLink].get";
import indexPage from "./indexPage";
import chatPlugin from "./module/Chat/chatPlugin";
import { NonStartedDurakGame } from "./module/DurakGame/NonStartedDurakGame";
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

dotenv.config();

const uuidRegex =
  /[\da-fA-F]{8}\b-[\da-fA-F]{4}\b-[\da-fA-F]{4}\b-[\da-fA-F]{4}\b-[\da-fA-F]{12}$/;
export const durakGames = new Map<string, NonStartedDurakGame | DurakGame>();
class DurakGamesStore {
  #value: (NonStartedDurakGame | DurakGame)[];

  constructor() {
    this.#value = [];
  }

  get value() {
    return 1;
  }

  add() {}

  remove() {}
}
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
export type FastifyInstance = typeof fastify;

export const store: SessionStore = new PrismaSessionStore(new PrismaClient(), {
  checkPeriod: env.SESSION_STORE_CHECK_PERIOD,
  loggerLevel: ["log", "warn", "error"],
});

fastify
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .register(fastifyStatic, { root: path.join(__dirname, "../static") })
  .register(fastifyCors, { origin: [...env.CORS_ORIGIN] })
  .register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "https://xsgames.co/randomusers/assets/avatars/pixel/",
          "https://cdn.7tv.app/emote/6306876cbe8c19d70f9d6b22/4x.webp",
        ],
      },
    },
  })
  .register(fastifyCookie)
  .register(fastifySession, {
    cookieName: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    cookie: {
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
  .register(VkAuth)
  .register(GithubAuth)
  .register(indexPage)
  .register(getMe)
  .register(getUserProfile)
  .register(chatPlugin, { path: "/global-chat" })
  .register(gameLobbiesPlugin)
  .ready()
  .then(
    function (this: typeof fastify) {
      instrument(this.io, { auth: false, mode: "development" });
      const durakGame: DurakGameSocket.Namespace = this.io.of(
        new RegExp("game/" + uuidRegex),
      );
      fastify.log.info("durak game io", this.io.path(), durakGame.name);
      setUserProfileIntoSocketData.call(this, durakGame);
      durakGame.on("connect", durakGameSocketHandler);
    }.bind(fastify),
  );

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

function _decorator_example<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  __context__: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  return function (this: This, ...args: Args): Return {
    return target.apply(this, args);
  };
}

function setUserProfileIntoSocketData(
  this: FastifyInstance,
  durakGame: DurakGameSocket.Namespace,
) {
  durakGame.use(
    // Вопрос: Что делать с обычным пользователем, не являющимся игроком данной игры?
    // Ответ: Просто пропустим пользователя далее, однако
    // далее его сообщения к серверу игнорируются
    // он может только получить данные игры и
    // он не имеет права хода в игре
    // NOTE: для пропуска пользователя далее просто вызываем в middleware next без аргументов
    (socket, next) => {
      if (!socket.handshake.headers.cookie) return next();
      const cookie = this.parseCookie(socket.handshake.headers.cookie);
      const sessionId = cookie[env.SESSION_COOKIE_NAME];
      if (!sessionId) return next();
      socket.data.sessionId = sessionId;
      store.get(sessionId, (error, session) => {
        if (error || !session) {
          this.log.error("store couldn't get session data", {
            error,
            session,
          });
          return next();
        }
        socket.data.user = session.user;
        socket.data.userProfile = session.userProfile ?? raise();
        return next();
      });
    },
  );
}
