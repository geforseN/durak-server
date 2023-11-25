import { FastifyInstance } from "fastify";

export default async function getMe(fastify: FastifyInstance) {
  return fastify.route({
    method: "GET",
    url: "/api/me",
    async handler(request, reply) {
      console.log(request.session.user);
      this.log.info({ user: request.session.user || {} });
      if (
        !request.session.user ||
        !Object.values(request.session.user || {}).length
      ) {
        return reply
          .status(401)
          .send({ reason: "Unauthorized. Make login POST request" });
      }
      return request.session.user;
    },
  });
}
