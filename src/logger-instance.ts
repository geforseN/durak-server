import { pino, type LoggerOptions } from "pino";

const makeOptions = (
  env: "development" | "production",
  options?: LoggerOptions,
): LoggerOptions => {
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
  }
};

export function makeLoggerInstance(
  env: "development" | "production",
  options?: LoggerOptions,
) {
  return pino(makeOptions(env, options));
}
