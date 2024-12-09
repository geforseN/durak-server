import { isDevelopment } from "std-env";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  createAnonymousUser,
  mutateSessionWithAnonymousUser,
} from "./login.instance-decorators.js";

export default <FastifyPluginAsyncZod>async function (fastify) {
  let redirectUrl = process.env.AUTH_REDIRECT_URL;
  if (!redirectUrl) {
    const defaultRedirectUrl = isDevelopment
      ? "http://localhost:5173"
      : "https://play-durak.vercel.app";
    fastify.log.warn(
      "AUTH_REDIRECT_URL not found in environment, using %s",
      defaultRedirectUrl,
    );
    redirectUrl = defaultRedirectUrl;
  }
  fastify.decorate(
    "mutateSessionWithAnonymousUser",
    mutateSessionWithAnonymousUser,
  );
  fastify.decorate("createAnonymousUser", createAnonymousUser);
  fastify.route({
    method: "POST",
    url: "/api/auth/login",
    async handler(request, reply) {
      if (typeof request.session.user?.isAnonymous === "undefined") {
        await this.mutateSessionWithAnonymousUser(request);
      }
      return reply.redirect(redirectUrl);
    },
  });
};
