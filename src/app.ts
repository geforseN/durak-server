import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyIO from "fastify-socket.io";
import fastifyAutoload from "@fastify/autoload";
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

async function createFastify(app: FastifyInstance) {
  const { BasePlayer } = await import(
    "./module/DurakGame/entity/Player/BasePlayer.abstract.js"
  );
  BasePlayer.configureDependencies();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .register(fastifyCors, {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    })
    .register(fastifyFormbody)
    .register(fastifyCookie)
    .register(fastifySession, getFastifySessionSettings(env, sessionStore))
    .register(fastifyWebsocket)
    .register(fastifyAutoload, {
      dir: path.join(__dirname, "plugins"),
      ignorePattern: /^.*(?:test|spec).ts$/,
      indexPattern: /"^.*.auto-load.ts$/,
      matchFilter: /"^.*.auto-load.ts$/,
    })
    .register(createUser)
    .register(getMe)
    .register(getUserProfile)
    .register(chatPlugin, { path: "/global-chat" })
    .register(gameLobbiesPlugin)
    .register(fastifyIO.default, {
      cors: {
        credentials: true,
        origin: env.SOCKET_IO_CORS_ORIGIN,
        methods: ["GET", "POST"],
      },
    })
    .ready()
    .then(() => {
      createSocketIoServer(
        // @ts-expect-error Property 'io' does not exist on type 'FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>'
        app.io,
        sessionStore,
      );
    });
  return app.withTypeProvider<ZodTypeProvider>();
}

export type FastifyInstanceT = Awaited<ReturnType<typeof createFastify>>;

export default createFastify;
