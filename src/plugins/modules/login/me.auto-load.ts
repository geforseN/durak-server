export default <FastifyPluginAsyncZod>async function (app) {
  const getMe: RouteHandlerMethod = async function (this, request, reply) {
    const log = this.log.child({ _route: "GET /api/me" });
    if (!request.session.user) {
      log.trace({ user: request.session.user }, "no user in session");
      return reply
        .status(401)
        .send({ reason: "Unauthorized. Make login POST request" });
    }
    log.trace({ user: request.session.user }, "user in session");
    return request.session.user;
  };

  app.get("/api/me", getMe);
  app.get("/api/auth/me", getMe);
};
