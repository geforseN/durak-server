import { isDevelopment } from "std-env";
import { decorate } from "@/plugins/modules/login/login.instance-decorators.js";

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

  decorate(app);

  app.post("/anonymous", async function (this, request, reply) {
    this.log.info("POST /api/auth/login");
    if (request.session.user === undefined) {
      this.log.trace("started anonymous user creation");
      const { user, log } = await this.createUserAndLogger(() =>
        this.createAnonymousUser(),
      );
      this.mutateSession(request, user, log);
      await this.saveSessionInStore(request, log);
    }
    return reply.redirect(redirectUrl);
  });
};

export const autoPrefix = "/api/auth/login";
