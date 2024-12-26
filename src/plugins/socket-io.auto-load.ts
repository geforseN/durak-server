import assert from "node:assert";
import fastifySocketIO from "fastify-socket.io";
import type SocketIO from "socket.io";
import { createSocketIoServer, env } from "@/config/index.js";

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
    .then(async () => {
      assert("io" in app);
      await createSocketIoServer(<SocketIO.Server>app.io, app.log);
      app.log.trace('Loaded `socket-io` plugin.');
    });
};
