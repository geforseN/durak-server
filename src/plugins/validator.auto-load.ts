import fastifyTypeProviderZod from "fastify-type-provider-zod";

export default <FastifyPluginAsyncZod>async function (app) {
  app
    .setValidatorCompiler(fastifyTypeProviderZod.validatorCompiler)
    .setSerializerCompiler(fastifyTypeProviderZod.serializerCompiler);
  app.log.info("Loaded `zod` validator and serializer.");
};
