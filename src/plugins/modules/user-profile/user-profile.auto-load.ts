import z from "zod";
import assert from "assert";
import { prisma } from "../../../config/index.js";
import { FastifyInstanceT } from "../../../app.js";

export default function (fastify: FastifyInstanceT) {
  return fastify.route({
    method: "GET",
    url: "/api/profiles/:personalLink",
    schema: {
      params: z.object({
        personalLink: z.string({
          description: "Не указана ссылка пользователя",
        }),
      }),
    },
    async handler(request) {
      const user = await prisma.userProfile.findFirst({
        where: { personalLink: request.params.personalLink },
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
