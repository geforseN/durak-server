import path from "node:path";
import Fastify from "fastify/fastify.js";
import type { FastifyBaseLogger, FastifyListenOptions } from "fastify";

export async function makeFastify(
  listenOptions: FastifyListenOptions,
  loggerInstance: FastifyBaseLogger,
) {
  loggerInstance.trace("Making Fastify instance...");
  const fastify = Fastify({
    loggerInstance,
  });
  fastify.log.trace("Auto-loading plugins...");
  await fastify.register(import("@fastify/autoload"), {
    dir: path.join(import.meta.dirname, "plugins"),
    matchFilter: (path) => path.endsWith(".auto-load.ts"),
    forceESM: true,
    dirNameRoutePrefix: false,
  });
  fastify.log.trace("Trying to listen...");
  const address = await fastify.listen(listenOptions);
  fastify.log.info("Listening on address", address);
}
