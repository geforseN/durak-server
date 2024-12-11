import fp from "fastify-plugin";
import { fastifyCookie } from "@fastify/cookie";
import { fastifyCors } from "@fastify/cors";
import { fastifyFormbody } from "@fastify/formbody";
import { fastifySession } from "@fastify/session";
import { fastifyWebsocket } from "@fastify/websocket";
import { env, sessionStore } from "../config/index.js";

export default fp(<FastifyPluginAsyncZod>async function (app) {
  await app
    .register(fastifyCors, {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    })
    .register(fastifyFormbody)
    .register(fastifyCookie)
    .register(fastifySession, {
      cookie: {
        domain: env.SESSION_COOKIE_DOMAIN,
        maxAge: env.SESSION_COOKIE_MAX_AGE,
        sameSite: "lax",
        secure: !env.IS_DEV,
        httpOnly: true,
      },
      cookieName: env.SESSION_COOKIE_NAME,
      saveUninitialized: false,
      secret: env.SESSION_SECRET,
      store: sessionStore,
    })
    .register(fastifyWebsocket);
  app.log.info("Loaded `core` plugins.");
});
