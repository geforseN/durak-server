import { z } from "zod";
import crypto from "node:crypto";
import raise from "../common/raise.js";

export const getParsedEnv = (nodeEnv: NodeJS.ProcessEnv) => {
  return z
    .object({
      IS_DEV: z
        .string()
        .transform((v) =>
          v === "false" ? false : v === "true" ? true : raise(),
        ),
      DATABASE_URL: z.string(),
      PORT: z.string().default("3000").transform(Number),
      CORS_ORIGIN: z
        .string()
        .default("http://localhost:5173, http://127.0.0.1:5173")
        .transform((v) => v.split(",").map((str) => str.trim())),
      SOCKET_IO_PORT: z.string().default("3001").transform(Number),
      SOCKET_IO_CORS_ORIGIN: z
        .string()
        .default("https://admin.socket.io, http://localhost:5173")
        .transform((v) => v.split(",").map((str) => str.trim())),
      SESSION_COOKIE_DOMAIN: z.string().default("localhost"),
      SESSION_COOKIE_NAME: z.string().default("sessionId"),
      SESSION_COOKIE_MAX_AGE: z
        .string()
        .default("864000000" /* 10 days */)
        .transform(Number),
      SESSION_STORE_CHECK_PERIOD: z
        .string()
        .default("600000" /* 10 minutes */)
        .transform(Number),
      SESSION_SECRET: z
        .string()
        .default(crypto.randomBytes(64).toString("base64url")),
    })
    .parse(nodeEnv);
};
