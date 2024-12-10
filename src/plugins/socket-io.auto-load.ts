import assert from "node:assert";
import fastifySocketIO from "fastify-socket.io";
import type SocketIO from "socket.io";
import { createSocketIoServer, env, sessionStore } from "../config/index.js";

export default <FastifyPluginAsyncZod>async function (app) {
  app
    .register(fastifySocketIO.default, {
      cors: {
        credentials: true,
        origin: env.SOCKET_IO_CORS_ORIGIN,
        methods: ["GET", "POST"],
      },
    })
    .ready()
    .then(() => {
      assert("io" in app);
      createSocketIoServer(<SocketIO.Server>app.io, sessionStore);
      app.log.info('Loaded `socket-io` plugin.');
    });
};
