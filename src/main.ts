import path from "node:path";
import { fileURLToPath } from "node:url";
import z from "zod";
import Fastify from "fastify";
import { isDevelopment } from "std-env";
import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
});

const FastifyListerOptionsSchema = z.object({
  PORT: z.coerce.number().int().default(10000),
  HOST: z
    .string()
    .optional()
    .default(() => (isDevelopment ? "localhost" : "0.0.0.0")),
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = (env: z.infer<typeof EnvSchema>["NODE_ENV"]) => {
  switch (env) {
    case "development": {
      return {
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      };
    }
    case "production": {
      return true;
    }
  }
};

const start = async () => {
  try {
    BasePlayer.configureDependencies();
    const fastifyListenOptions = FastifyListerOptionsSchema.transform(
      ({ PORT, HOST }) => ({
        port: PORT,
        host: HOST,
      }),
    ).parse(process.env);
    const fastify = Fastify({
      logger: logger(EnvSchema.parse(process.env).NODE_ENV),
    });
    fastify.log.trace("Auto-loading plugins...");
    await fastify.register(import("@fastify/autoload"), {
      dir: path.join(__dirname, "plugins"),
      matchFilter: (path) => path.endsWith(".auto-load.ts"),
      forceESM: true,
      dirNameRoutePrefix: false,
    });
    fastify.log.trace("Trying to listen...");
    const address = await fastify.listen(fastifyListenOptions);
    fastify.log.info("Listening on address", address);
  } catch (reason) {
    console.error(`Failed to start`, { reason });
    process.exitCode = 1;
  }
};

start().catch((error) => {
  console.error("Unknown error", error);
  process.exitCode = 2;
});
