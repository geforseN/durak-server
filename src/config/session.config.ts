import { z } from "zod";
import { stringToArray } from "@/common/zod.js";
import type { ILevel } from "@quixo3/prisma-session-store/dist/@types/logger.js";

const Schema = z.object({
  SESSION_STORE_CHECK_PERIOD: z.coerce
    .number()
    .default(600000 /* 10 minutes */),
  SESSION_STORE_LOGGER_LEVELS: z.string().default("log,warn,error"),
});

const transformedSchema = Schema.transform((schema) => ({
  checkPeriod: schema.SESSION_STORE_CHECK_PERIOD,
  loggerLevel: <ILevel[]>stringToArray(schema.SESSION_STORE_LOGGER_LEVELS),
}));

export const storeConfig = transformedSchema.parse(process.env);
