import Fastify from "fastify";
import createFastify from "./app.js";
import { consola } from "consola";
import { isDevelopment } from "std-env";
import { z } from "zod";

const FastifyListerOptionsSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.coerce.number().int().default(10000),
  HOST: z
    .string()
    .optional()
    .default(() => (isDevelopment ? "localhost" : "0.0.0.0")),
});

const start = async () => {
  const log = consola.withTag("Fastify");
  try {
    const fastifyListenOptions = FastifyListerOptionsSchema.transform(
      ({ PORT, HOST }) => ({
        port: PORT,
        host: HOST,
      }),
    ).parse(process.env);
    log.info("Creating...");
    const fastify = await createFastify(Fastify({ logger: true }));
    log.start("Trying to listen...");
    const address = await fastify.listen(fastifyListenOptions);
    log.success("Listening on address", address);
  } catch (reason) {
    log.error(`Failed to start`, { reason });
    process.exitCode = 1;
  }
};

start().catch((error) => {
  consola.error("Unknown error", error);
  process.exitCode = 2;
});
