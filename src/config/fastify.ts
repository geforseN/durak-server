import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import { fastifyFormbody } from "@fastify/formbody";
import {
  FastifySessionOptions,
  SessionStore,
  fastifySession,
} from "@fastify/session";
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import { PrismaClient } from "@prisma/client";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import getMe from "../api/me.js";
import getUserProfile from "../api/profile/[personalLink].get.js";

import indexPage from "../api/indexPage.js";
import { sessionApi } from "../api/session.js";
import chatPlugin from "../module/Chat/chatPlugin.js";
import gameLobbiesPlugin from "../module/Lobbies/lobbies.plugin.js";
import { pathForStatic } from "./index.js";
import PinoPretty from "pino-pretty";
import { getParsedEnv } from "./zod-env.js";

function getFastifySessionSettings(
  env: ReturnType<typeof getParsedEnv>,
  store: SessionStore,
) {
  return {
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
  } satisfies FastifySessionOptions;
}

export function createFastify(
  env: ReturnType<typeof getParsedEnv>,
  sessionStore: SessionStore,
) {
  const fastify = Fastify({
    logger: {
      // @ts-expect-error ts import problem
      stream: PinoPretty({ colorize: true }),
    },
  }).withTypeProvider<ZodTypeProvider>();

  fastify
    .decorate("prisma", new PrismaClient())
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .register(fastifyStatic, { root: pathForStatic })
    .register(fastifyCors, {
      origin: ["https://admin.socket.io", "http://localhost:5173"],
      credentials: true,
    })
    .register(fastifyFormbody)
    .register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          connectSrc: [
            "'self'",
            "http://127.0.0.1:3001",
            "ws://127.0.0.1:3001",
            "http://127.0.0.1:3000",
            "http://localhost:3000/",
            "http://localhost:5173/",
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
    .register(fastifySession, getFastifySessionSettings(env, sessionStore))
    .register(fastifyWebsocket)
    .register(indexPage)
    .register(sessionApi)
    .register(getMe)
    .register(getUserProfile)
    .register(chatPlugin, { path: "/global-chat" })
    .register(gameLobbiesPlugin)
    .setNotFoundHandler(async function (this: typeof fastify, _, reply) {
      this.log.error("setNotFoundHandler");
      return reply.type("text/html").sendFile("index.html");
    });
  console.log(12345, 12345, 12345, 12345, 12345, 12345, 12345, 12345, 12345);
  return fastify;
}

export type FastifyInstanceT = ReturnType<typeof createFastify>;
