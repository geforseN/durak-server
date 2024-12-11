import crypto from 'node:crypto'
import { z } from "zod";
import { pino } from "pino";

import { stringToArray } from "@/common/index.js";

const logger = pino()

export const getParsedEnv = (nodeEnv: NodeJS.ProcessEnv) => {
  return z
    .object({
      DATABASE_URL: z.string().refine((value) => {
        if (!value) {
          logger.warn({
            message: "DATABASE_URL env variable is not specified, Prisma relies on it",
          });
        }
        return !!value;
      }),
      PORT: z.string().default("3000").transform(Number),
      CORS_ORIGIN: z
        .string()
        .default("http://localhost:5173, http://127.0.0.1:5173")
        .transform(stringToArray),
      SOCKET_IO_PORT: z.string().default("3001").transform(Number),
      SOCKET_IO_CORS_ORIGIN: z
        .string()
        .default("https://admin.socket.io, http://localhost:5173")
        .transform(stringToArray),
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
      SESSION_SECRET: z.string().default(crypto.randomBytes(64).toString("base64url")),
    })
    .parse(nodeEnv);
};
