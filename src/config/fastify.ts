import type { FastifySessionOptions, SessionStore } from "@fastify/session";
import type { getParsedEnv } from "./zod-env.js";

export function getFastifySessionSettings(
  env: ReturnType<typeof getParsedEnv>,
  store: SessionStore,
) {
  return {
    cookie: {
      domain: env.SESSION_COOKIE_DOMAIN,
      maxAge: env.SESSION_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: !env.IS_DEV,
      httpOnly: true,
    },
    cookieName: env.SESSION_COOKIE_NAME,
    saveUninitialized: false,
    secret: env.SESSION_SECRET,
    store,
  } satisfies FastifySessionOptions;
}
