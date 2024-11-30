import Fastify from "fastify";
import createFastify from "./app.js";
import consola from "consola";

const start = async () => {
  const port = 10000;
  const log = consola.withTag("Fastify");
  try {
    log.info("Creating...");
    const fastify = await createFastify(Fastify({ logger: true }));
    log.info("Trying to listen...");
    const address = await fastify.listen({ port });
    log.info("Listening on address ", address);
  } catch (reason) {
    log.error(`Failed to start`, { reason });
    throw reason;
  }
};

start().catch(() => {
  process.exitCode = 1;
});
