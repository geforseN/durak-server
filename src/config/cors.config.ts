import { z } from "zod";
import { stringToArray } from "@/utils/zod.js";
import { EnvSchema } from "@/config/env.js";
import { handleEnvDefault } from "@/config/utils.js";
import type { FastifyCorsOptions } from "@fastify/cors";

const CORSSchema = z.object({
  FRONTEND_URL: EnvSchema.shape.FRONTEND_URL,
  FASTIFY_CORS_ORIGIN: z.string().optional(),
  FASTIFY_CORS_METHODS: z
    .string()
    .default("GET, POST")
    .transform(stringToArray),
});

export const parseFastifyCorsPluginConfig = CORSSchema.transform((arg) => {
  let origin = arg.FASTIFY_CORS_ORIGIN;
  if (!origin) {
    origin = handleEnvDefault(
      "FASTIFY_CORS_ORIGIN",
      arg.FRONTEND_URL,
      console.warn,
    );
  }
  return {
    credentials: true,
    origin,
    methods: arg.FASTIFY_CORS_METHODS,
  } satisfies FastifyCorsOptions;
}).parse;
