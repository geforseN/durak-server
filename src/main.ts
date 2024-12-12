import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import { makeLoggerInstance } from "@/logger.js";
import { makeFastify } from "@/fastify.js";
import { parseEnv } from "@/config/env.js";

async function main() {
  try {
    const env = parseEnv(process.env);
    if (env.NODE_ENV === "production") {
      console.log(process.env);
    }
    const loggerInstance = makeLoggerInstance(env.NODE_ENV, {
      level: env.LOGGER_LEVEL,
    });
    BasePlayer.configureDependencies();
    const fastifyListenOptions = {
      port: env.PORT,
      host: env.HOST,
    };
    await makeFastify(fastifyListenOptions, loggerInstance);
  } catch (reason) {
    console.error(`Failed to start`, { reason });
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unknown error", error);
  process.exitCode = 2;
});
