import fastifyTypeProviderZod from "fastify-type-provider-zod";
import fp from "fastify-plugin";

export default fp(<FastifyPluginAsyncZod>async function (app) {
  app
    .setValidatorCompiler(fastifyTypeProviderZod.validatorCompiler)
    .setSerializerCompiler(fastifyTypeProviderZod.serializerCompiler);
  app.log.info("Loaded `zod` validator and serializer.");
});
