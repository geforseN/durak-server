import { z } from "zod";
import { stringToArray } from "@/utils/zod.js";
import { EnvSchema } from "@/config/env.js";
import { isDevelopment } from "std-env";
import { handleEnvDefault } from "@/config/utils.js";

export const SocketIOSchema = z.object({
  FRONTEND_DOMAIN: EnvSchema.shape.FRONTEND_DOMAIN,
  SOCKET_IO_CORS_ORIGIN: z.string().optional(),
  SOCKET_IO_CORS_METHODS: z
    .string()
    .default("GET, POST")
    .transform(stringToArray),
});

export const parseSocketIoPluginConfig = SocketIOSchema.transform((arg) => {
  let corsOrigin = arg.SOCKET_IO_CORS_ORIGIN;
  if (!corsOrigin) {
    const value = isDevelopment
      ? arg.FRONTEND_DOMAIN
      : arg.FRONTEND_DOMAIN.concat(", http://localhost:5173");
    corsOrigin = handleEnvDefault("SOCKET_IO_CORS_ORIGIN", value, console.warn);
  }
  return {
    cors: {
      credentials: true,
      origin: corsOrigin,
      methods: arg.SOCKET_IO_CORS_METHODS,
    },
  };
}).parse;
