import { fastifyCookie } from "@fastify/cookie";
import { fastifyCors } from "@fastify/cors";
import { fastifyFormbody } from "@fastify/formbody";
import { fastifySession } from "@fastify/session";
import { fastifyWebsocket } from "@fastify/websocket";
import { getFastifySessionSettings } from "../config/fastify.js";
import { env, sessionStore } from "../config/index.js";

export default <FastifyPluginAsyncZod>async function (app) {
  await app
    .register(fastifyCors, {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    })
    .register(fastifyFormbody)
    .register(fastifyCookie)
    .register(fastifySession, getFastifySessionSettings(env, sessionStore))
    .register(fastifyWebsocket);
  app.log.info("Loaded `core` plugins.");
};
