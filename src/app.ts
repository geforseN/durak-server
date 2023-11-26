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
  _options: Record<string, unknown> | Record<string, never>,
) {
  const { BasePlayer } = await import(
    "./module/DurakGame/entity/Player/BasePlayer.abstract.js"
  );
  BasePlayer.configureDependencies();
  createSocketIoServer(env, sessionStore);
  console.log(
    { env },
    env.CORS_ORIGIN,
    [...env.CORS_ORIGIN],
    env.CORS_ORIGIN instanceof Array,
    Array.isArray(env.CORS_ORIGIN),
  );
  app
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .register(fastifyCors, {
      origin: [...env.CORS_ORIGIN],
      methods: ["GET", "POST"],
      credentials: true,
    })
    .register(fastifyFormbody)
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
