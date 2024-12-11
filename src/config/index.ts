import { getParsedEnv } from "@/config/zod-env.js";

export const env = getParsedEnv(process.env);
