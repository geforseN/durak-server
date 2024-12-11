import { isDevelopment } from "std-env";
import {
  createAnonymousUser,
  mutateSessionWithAnonymousUser,
} from "@/plugins/modules/login/login.instance-decorators.js";

export default <FastifyPluginAsyncZod>async function (app) {
  let redirectUrl = process.env.AUTH_REDIRECT_URL;
  if (!redirectUrl) {
    const defaultRedirectUrl = isDevelopment
      ? "http://localhost:5173"
      : "https://play-durak.vercel.app";
    app.log.warn(
      "AUTH_REDIRECT_URL not found in environment, using %s",
      defaultRedirectUrl,
    );
    redirectUrl = defaultRedirectUrl;
  }
  app.decorate(
    "mutateSessionWithAnonymousUser",
    mutateSessionWithAnonymousUser,
  );
  app.decorate("createAnonymousUser", createAnonymousUser);

  const onLogin: RouteHandlerMethod = async function (this, request, reply) {
    this.log.info("POST /api/auth/login");
    if (request.session.user === undefined) {
      await this.mutateSessionWithAnonymousUser(request);
    }
    return reply.redirect(redirectUrl);
  };

  app.post("", onLogin);
  app.post("/anonymous", onLogin);
};

export const autoPrefix = "/api/auth/login";
