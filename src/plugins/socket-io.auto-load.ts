import assert from "node:assert";
import fastifySocketIO from "fastify-socket.io";
import type { FastifyInstance } from "fastify";
import type SocketIO from "socket.io";
import { createSocketIoServer, env, sessionStore } from "../config/index.js";

export default function (app: FastifyInstance) {
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
      createSocketIoServer(app.io as unknown as SocketIO.Server, sessionStore);
    });
}
