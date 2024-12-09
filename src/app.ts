import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyAutoload from "@fastify/autoload";
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
import fastifySocketIO from "fastify-socket.io";
import assert from "node:assert";
import type SocketIO from "socket.io";

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

  console.log("before fastifyAutoload");
  await app.register(fastifyAutoload, {
    dir: path.join(__dirname, "plugins"),
    ignorePattern: /^.*(?:test|spec).ts$/,
    indexPattern: /"^.*.auto-load.ts$/,
    forceESM: true,
    encapsulate: false
  });
  console.log("after fastifyAutoload");
  await app
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    .register(createUser)
    .register(getMe)
    .register(getUserProfile)
    .register(chatPlugin, { path: "/global-chat" })
    .register(gameLobbiesPlugin);
  await app.register(fastifySocketIO.default, {
    cors: {
      credentials: true,
      origin: env.SOCKET_IO_CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });
  await app.ready();
  assert("io" in app);
  createSocketIoServer(app.io as unknown as SocketIO.Server, sessionStore);
  return app.withTypeProvider<ZodTypeProvider>();
}

export type FastifyInstanceT = Awaited<ReturnType<typeof createFastify>>;

export default createFastify;
