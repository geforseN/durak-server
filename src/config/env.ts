import { z } from "zod";
import { handleEnvDefaultForDevOnly } from "@/config/utils.js";
import { isDevelopment } from "std-env";

const NodeEnvSchema = z.enum(["development", "production"]);

export type NodeEnv = z.infer<typeof NodeEnvSchema>;

export const EnvSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  PORT: z.coerce.number().int().default(10000),
  HOST: z
    .string()
    .optional()
    .default(() => (isDevelopment ? "localhost" : "0.0.0.0")),
  FRONTEND_URL: z
    .string()
    .default(() =>
      handleEnvDefaultForDevOnly(
        "FRONTEND_URL",
        "http://localhost:5173",
        console.warn,
      ),
    ),
  FRONTEND_DOMAIN: z
    .string()
    .default(() =>
      handleEnvDefaultForDevOnly("FRONTEND_DOMAIN", "localhost", console.warn),
    ),
  DATABASE_URL: z.string({
    message: "DATABASE_URL env variable is not specified, Prisma relies on it",
  }),
  DIRECT_URL: z.string().optional(),
  LOGGER_LEVEL: z.string().default("info"),
});

const TransformedEnvSchema = EnvSchema.transform((arg) => {
  const DIRECT_URL = arg.DIRECT_URL ?? arg.DATABASE_URL;
  return {
    ...arg,
    DIRECT_URL,
  };
});

export const parseEnv = TransformedEnvSchema.parse;
