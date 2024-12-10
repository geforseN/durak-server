import fastifyTypeProviderZod from "fastify-type-provider-zod";

export default <FastifyPluginAsyncZod>async function (app) {
  app
    .setValidatorCompiler(fastifyTypeProviderZod.validatorCompiler)
    .setSerializerCompiler(fastifyTypeProviderZod.serializerCompiler);
};
