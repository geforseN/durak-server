import z from "zod";
import assert from "assert";
import { prisma, type FastifyInstanceT } from "../../config/index.js";

export default function getUserProfile(fastify: FastifyInstanceT) {
  return fastify.route({
    method: "GET",
    url: "/profile",
    schema: {
      querystring: z.object({
        personalLink: z.string({
          description: "Не указана ссылка пользователя",
        }),
      }),
    },
    async handler(request) {
      const user = await prisma.userProfile.findFirst({
        where: { personalLink: request.query.personalLink },
        select: {
          nickname: true,
          connectStatus: true,
          photoUrl: true,
          User: { include: { UserGameStat: true } },
        },
      });
      assert.ok(user, "No access");
      return user;
    },
  });
}
