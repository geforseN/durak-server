import type { FastifyPluginAsyncZod as _FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { ResolveFastifyReplyReturnType } from "fastify/types/type-provider.d.ts";
import type {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  FastifyTypeProvider,
  FastifyTypeProviderDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
  RouteGenericInterface,
} from "fastify";

declare global {
  type FastifyPluginAsyncZod<
    Options extends FastifyPluginOptions = Record<never, never>,
    Server extends RawServerBase = RawServerDefault,
  > = _FastifyPluginAsyncZod<Options, Server>;

  type RouteHandlerMethod<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends
      RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends
      RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
    ContextConfig = ContextConfigDefault,
    SchemaCompiler extends FastifySchema = FastifySchema,
    TypeProvider extends FastifyTypeProvider = FastifyTypeProviderDefault,
    Logger extends FastifyBaseLogger = FastifyBaseLogger,
  > = (
    this: FastifyInstance<
      RawServer,
      RawRequest,
      RawReply,
      Logger,
      TypeProvider
    >,
    request: FastifyRequest<
      RouteGeneric,
      RawServer,
      RawRequest,
      SchemaCompiler,
      TypeProvider,
      ContextConfig,
      Logger
    >,
    reply: FastifyReply<
      RouteGeneric,
      RawServer,
      RawRequest,
      RawReply,
      ContextConfig,
      SchemaCompiler,
      TypeProvider
    >,
  ) => ResolveFastifyReplyReturnType<
    TypeProvider,
    SchemaCompiler,
    RouteGeneric
  >;
}

export {};
