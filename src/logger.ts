import assert from "node:assert";
import { pino, type LoggerOptions } from "pino";

function makeLoggerOptions(
  env: NodeEnv,
  options?: LoggerOptions,
): LoggerOptions {
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
        ...options,
      };
    }
    case "production": {
      return { ...options };
    }
    default: {
      assert.fail(`Unknown env ${env}`);
    }
  }
}

export function makeLoggerInstance(env: NodeEnv, options?: LoggerOptions) {
  return pino(makeLoggerOptions(env, options));
}
