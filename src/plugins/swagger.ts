import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import {
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransform,
  fastifyZodOpenApiTransformObject,
} from "fastify-zod-openapi";
import fp from "fastify-plugin";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

export default fp(<FastifyPluginAsyncZod>async function (app) {
  await app.register(fastifyZodOpenApiPlugin);
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Durak The Game",
        version: "1.0.0",
      },
    },
    transform: fastifyZodOpenApiTransform,
    transformObject: fastifyZodOpenApiTransformObject,
  });
  await app.register(fastifySwaggerUI, {
    theme: {
      css: [
        {
          filename: "theme.css",
          content: new SwaggerTheme().getBuffer(SwaggerThemeNameEnum.DARK),
        },
      ],
    },
  });
  app.log.info("Loaded `swagger` plugins.");
});
