export default <FastifyPluginAsyncZod>async function (app) {
  app.route({
    method: "GET",
    url: "/api/me",
    async handler(request, reply) {
      const log = this.log.child({ _route: "GET /api/me" });
      if (!request.session.user) {
        log.trace({ user: request.session.user }, "no user in session");
        return reply
          .status(401)
          .send({ reason: "Unauthorized. Make login POST request" });
      }
      log.trace({ user: request.session.user }, "user in session");
      return request.session.user;
    },
  });
};
