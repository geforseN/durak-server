import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import { fastifyAutoload } from "@fastify/autoload";
import { consola } from "consola";
import { isDevelopment } from "std-env";
import { z } from "zod";
import { BasePlayer } from "./module/DurakGame/entity/Player/BasePlayer.abstract.js";

const FastifyListerOptionsSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.coerce.number().int().default(10000),
  HOST: z
    .string()
    .optional()
    .default(() => (isDevelopment ? "localhost" : "0.0.0.0")),
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const start = async () => {
  const log = consola.withTag("Fastify");
  try {
    BasePlayer.configureDependencies();
    const fastifyListenOptions = FastifyListerOptionsSchema.transform(
      ({ PORT, HOST }) => ({
        port: PORT,
        host: HOST,
      }),
    ).parse(process.env);
    log.info("Creating...");
    const fastify = Fastify({ logger: true });
    log.info("Auto-loading plugins...");
    await fastify.register(fastifyAutoload, {
      dir: path.join(__dirname, "plugins"),
      matchFilter: (path) => path.endsWith(".auto-load.ts"),
      forceESM: true,
      encapsulate: false,
    });
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
