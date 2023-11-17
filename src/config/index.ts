import "dotenv/config";
import { getParsedEnv } from "./zod-env.js";
import path from "path";

export const env = getParsedEnv(process.env);

export const pathForStatic = path
  .resolve(
    import.meta.url.replace("/dist", "").replace("src/config", ""),
    "./../static",
  )
  .split(":")[1];

export { createFastify, type FastifyInstanceT } from "./fastify.js";
export { createSocketIoServer } from "./socket-io.js";
export { prisma } from "./prisma.js";
