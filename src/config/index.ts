import "dotenv/config";
import { z } from "zod";
import path from "node:path";
import crypto from "node:crypto";
import { raise } from "../index.js";

// TODO remove process.env from codebase
export const env = z
  .object({
    DATABASE_URL: z.string(),
    FASTIFY_PORT: z.string().default("3000").transform(Number),
    CORS_ORIGIN: z
      .string()
      .default(
        "https://admin.socket.io, http://localhost:5173, http://127.0.0.1:5173",
      )
      .transform((v) => v.split(",").map((str) => str.trim())),
    SESSION_SECRET: z
      .string()
      .default(crypto.randomBytes(64).toString("base64url")),
    SESSION_COOKIE_NAME: z.string().default("sessionId"),
    IS_SESSION_SECURE: z
      .string()
      .default("false")
      .transform((v) =>
        v === "false" ? false : v === "true" ? true : raise(),
      ),
    SESSION_MAX_AGE: z
      .string()
      .default("864000000" /* 10 days */)
      .transform(Number),
    SESSION_STORE_CHECK_PERIOD: z
      .string()
      .default("600000" /* 10 minutes */)
      .transform(Number),
  })
  .parse(process.env);

export const pathForStatic = path
  .resolve(
    import.meta.url.replace("/dist", "").replace("src/config", ""),
    "./../static",
  )
  .split(":")[1];