import assert from "node:assert";
import { isDevelopment } from "std-env";

type Log = (message: string, ...args: unknown[]) => void;

export function handleEnvDefaultForDevOnly<T>(key: string, value: T, log: Log) {
  if (isDevelopment) {
    log("%s env var is not specified in development, using %s", key, value);
    return value;
  }
  assert.fail(key + " env var is not specified in production");
}

export function handleEnvDefault<T>(key: string, value: T, log: Log) {
  log(key + " env var is not specified, using %s", value);
  return value;
}
