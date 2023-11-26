import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import { fastifyFormbody } from "@fastify/formbody";
import { fastifySession } from "@fastify/session";
import fastifyWebsocket from "@fastify/websocket";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import getMe from "./api/me.js";
import getUserProfile from "./api/profiles/personalLink.js";
import { createUser } from "./api/auth/login.js";

import chatPlugin from "./module/Chat/chatPlugin.js";
import gameLobbiesPlugin from "./module/Lobbies/lobbies.plugin.js";
import { createSocketIoServer, env, sessionStore } from "./config/index.js";
import { FastifyInstance } from "fastify";
import { User, UserProfile } from "@prisma/client";
import { getFastifySessionSettings } from "./config/fastify.js";

declare module "fastify" {
  interface Session {
    user: User & { profile: UserProfile; isAnonymous: boolean };
  }
}

async function createFastify(
  app: FastifyInstance,
  _options: Record<string, unknown>,
) {
  const { BasePlayer } = await import(
    "./module/DurakGame/entity/Player/BasePlayer.abstract.js"
  );
  BasePlayer.configureDependencies();
  createSocketIoServer(env, sessionStore);
  app
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .register(fastifyCors, {
      origin: [...env.CORS_ORIGIN],
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
    .register(createUser)
    .register(getMe)
    .register(getUserProfile)
    .register(chatPlugin, { path: "/global-chat" })
    .register(gameLobbiesPlugin);
  return app.withTypeProvider<ZodTypeProvider>();
}

export type FastifyInstanceT = Awaited<ReturnType<typeof createFastify>>;

export default createFastify;
