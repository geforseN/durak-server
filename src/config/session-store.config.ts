import { z } from "zod";
import type { ILevel } from "@quixo3/prisma-session-store/dist/@types/logger.js";
import { stringToArray } from "@/utils/zod.js";

export const SessionStoreSchema = z.object({
  SESSION_STORE_CHECK_PERIOD: z.coerce
    .number()
    .default(600000 /* 10 minutes */),
  SESSION_STORE_LOGGER_LEVELS: z.union([
    z.string().default("log,warn,error").transform(stringToArray),
    z.array(z.string()).default(["log", "warn", "error"]),
  ]),
});

export const parseStoreConfig = SessionStoreSchema.transform((arg) => ({
  checkPeriod: arg.SESSION_STORE_CHECK_PERIOD,
  loggerLevel: <ILevel[]>arg.SESSION_STORE_LOGGER_LEVELS,
})).parse;
