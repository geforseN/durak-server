import Fastify from "fastify";
import createFastify from "./app.js";
import consola from "consola";
import { z } from "zod";

const FastifyListerOptionsSchema = z.object({
  PORT: z.coerce.number().int(),
  HOST: z.string(),
}).transform(({ PORT, HOST }) => ({
  port: PORT,
  host: HOST
}))

const start = async () => {
  const fastifyListenOptions = FastifyListerOptionsSchema.parse(process.env);
  const log = consola.withTag("Fastify");
  try {
    log.info("Creating...");
    const fastify = await createFastify(Fastify({ logger: true }));
    log.info("Trying to listen...");
    const address = await fastify.listen(fastifyListenOptions);
    log.info("Listening on address ", address);
  } catch (reason) {
    log.error(`Failed to start`, { reason });
    throw reason;
  }
};

start().catch(() => {
  process.exitCode = 1;
});
