import fp from "fastify-plugin";
import fastifyPrisma from "@joggr/fastify-prisma";

export default <FastifyPluginAsyncZod>fp(async function (app) {
  await app.register(fastifyPrisma);
  app.log.trace("Loaded `prisma` plugin.");
});
