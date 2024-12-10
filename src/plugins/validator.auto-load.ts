import type { FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

export default function (app: FastifyInstance) {
  app
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler);
}
