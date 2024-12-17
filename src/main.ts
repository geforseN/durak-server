import z from "zod";
import { isDevelopment } from "std-env";
import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import { makeLoggerInstance } from "@/logger-instance.js";
import { makeFastify } from "@/fastify.js";

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

process.on("uncaughtException", (error) => {
  console.error("There was an uncaught error:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const start = async () => {
  try {
    const nodeEnv = EnvSchema.parse(process.env).NODE_ENV;
    const loggerInstance = makeLoggerInstance(nodeEnv);
    BasePlayer.configureDependencies();
    const fastifyListenOptions = FastifyListerOptionsSchema.transform(
      ({ PORT, HOST }) => ({
        port: PORT,
        host: HOST,
      }),
    ).parse(process.env);
    const fastify = await makeFastify(fastifyListenOptions, loggerInstance);
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down...");
      fastify.close(() => {
        console.log("Server closed gracefully.");
        process.exit(0);
      });
    });

  } catch (reason) {
    console.error(`Failed to start`, { reason });
    process.exitCode = 1;
  }
};

start().catch((error) => {
  console.error("Unknown error", error);
  process.exitCode = 2;
});
