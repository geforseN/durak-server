import path from "node:path";
import url from "node:url";
import type { FastifyInstance, FastifyListenOptions } from "fastify";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export async function loadFastify(
  fastify: FastifyInstance,
  listenOptions: FastifyListenOptions,
) {
  fastify.log.trace("Auto-loading plugins...");
  await fastify.register(import("@fastify/autoload"), {
    dir: path.join(__dirname, "plugins"),
    matchFilter: (path) => path.endsWith(".auto-load.ts"),
    forceESM: true,
    encapsulate: false,
  });
  fastify.log.trace("Trying to listen...");
  const address = await fastify.listen(listenOptions);
  fastify.log.info("Listening on address", address);
}
