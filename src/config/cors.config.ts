import { z } from "zod";
import { stringToArray } from "@/utils/zod.js";

const CORSSchema = z
  .object({
    FASTIFY_CORS_ORIGIN: z.string(),
    FASTIFY_CORS_METHODS: z
      .string()
      .default("GET, POST")
      .transform(stringToArray),
  })
  .transform(() => ({
    credentials: true,
    origin: process.env.SOCKET_IO_CORS_ORIGIN,
    methods: process.env.SOCKET_IO_CORS_METHODS,
  }));

export const corsConfig = CORSSchema.parse(process.env);
