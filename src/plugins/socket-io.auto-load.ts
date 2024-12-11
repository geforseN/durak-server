import assert from "node:assert";
import fastifySocketIO from "fastify-socket.io";
import type SocketIO from "socket.io";
import { sessionStore } from "@/config/index.js";
import { createSocketIoServer } from "@/modules/socket-io/create-server.js";
import { pluginConfig } from "@/config/socket-io.config.js";

export default <FastifyPluginAsyncZod>async function (app) {
  app
    .register(fastifySocketIO.default, pluginConfig)
    .ready()
    .then(() => {
      assert("io" in app);
      createSocketIoServer(<SocketIO.Server>app.io, sessionStore);
      app.log.trace("Loaded `socket-io` plugin.");
    });
};
