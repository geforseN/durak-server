import { FastifyPluginAsyncZod as _FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { RawServerBase, RawServerDefault } from "fastify/types/utils.d.ts";
import { FastifyPluginOptions } from "fastify/types/plugin.d.ts";

declare global {
  type FastifyPluginAsyncZod<
    Options extends FastifyPluginOptions = Record<never, never>,
    Server extends RawServerBase = RawServerDefault,
  > = _FastifyPluginAsyncZod<Options, Server>;
}

export {};
