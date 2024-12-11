import { z } from "zod";
import { stringToArray } from "@/common/zod.js";

const Schema = z
  .object({
    SOCKET_IO_CORS_ORIGIN: z.string(),
    SOCKET_IO_CORS_METHODS: z
      .string()
      .default("GET, POST")
      .transform(stringToArray),
  })
  .transform(() => ({
    cors: {
      credentials: true,
      origin: process.env.SOCKET_IO_CORS_ORIGIN,
      methods: process.env.SOCKET_IO_CORS_METHODS,
    },
  }));

export const pluginConfig = Schema.parse(process.env);
