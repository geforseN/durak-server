import fp from "fastify-plugin";
import { fastifyCookie } from "@fastify/cookie";
import { fastifyCors } from "@fastify/cors";
import { fastifyFormbody } from "@fastify/formbody";
import { fastifySession } from "@fastify/session";
import { fastifyWebsocket } from "@fastify/websocket";
import { parseFastifyCorsPluginConfig } from "@/config/cors.config.js";
import { parseFastifySessionPluginConfig } from "@/config/session.config.js";

export default fp(<FastifyPluginAsyncZod>async function (app) {
  await app
    .register(fastifyCors, parseFastifyCorsPluginConfig(process.env))
    .register(fastifyFormbody)
    .register(fastifyCookie)
    .register(fastifySession, parseFastifySessionPluginConfig(process.env))
    .register(fastifyWebsocket);
  app.log.trace("Loaded `core` plugins.");
});
