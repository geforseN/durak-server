import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import fastifyPrisma from "@joggr/fastify-prisma";

export default <FastifyPluginAsyncZod>async function (app) {
  await app.register(fastifyPrisma);
};
