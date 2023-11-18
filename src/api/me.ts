import { FastifyInstance } from "fastify";

export default async function getMe(fastify: FastifyInstance) {
  return fastify.route({
    method: "GET",
    url: "/me",
    async handler(request, reply) {
      this.log.info({ user: request.session.user });
      return reply.send({ user: request.session.user });
    },
  });
}
