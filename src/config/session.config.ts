import crypto from "node:crypto";
import { z } from "zod";
import type { FastifySessionOptions } from "@fastify/session";
import { isDevelopment } from "std-env";
import { EnvSchema } from "@/config/env.js";
import { handleEnvDefault } from "@/config/utils.js";

const FastifySessionSchema = z.object({
  FRONTEND_DOMAIN: EnvSchema.shape.FRONTEND_DOMAIN,
  FASTIFY_SESSION_COOKIE_DOMAIN: z.string().optional(),
  FASTIFY_SESSION_COOKIE_NAME: z.string().default("sessionId"),
  FASTIFY_SESSION_SAME_SITE: z.string().default("lax"),
  FASTIFY_SESSION_SECURE: z.coerce.boolean().default(!isDevelopment),
  FASTIFY_SESSION_COOKIE_MAX_AGE: z.coerce
    .number()
    .default(864000000 /* 10 days */),
  FASTIFY_SESSION_SECRET: z
    .string()
    .default(crypto.randomBytes(64).toString("base64url")),
});

const TransformedFastifySessionSchema = FastifySessionSchema.transform(
  (arg) => {
    let cookieDomain = arg.FASTIFY_SESSION_COOKIE_DOMAIN;
    if (!cookieDomain) {
      cookieDomain = handleEnvDefault(
        "FASTIFY_SESSION_COOKIE_DOMAIN",
        arg.FRONTEND_DOMAIN,
        console.warn,
      );
    }
    return {
      cookie: {
        domain: cookieDomain,
        maxAge: arg.FASTIFY_SESSION_COOKIE_MAX_AGE,
        sameSite: <NonNullable<FastifySessionOptions["cookie"]>["sameSite"]>(
          arg.FASTIFY_SESSION_SAME_SITE
        ),
        secure: arg.FASTIFY_SESSION_SECURE,
        httpOnly: true,
      },
      cookieName: arg.FASTIFY_SESSION_COOKIE_NAME,
      saveUninitialized: false,
      secret: arg.FASTIFY_SESSION_SECRET,
    } satisfies FastifySessionOptions;
  },
);

export const parseFastifySessionPluginConfig =
  TransformedFastifySessionSchema.parse;
