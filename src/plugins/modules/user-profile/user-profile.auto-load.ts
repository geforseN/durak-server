import z from "zod";
import assert from "node:assert";
import { prisma } from "../../../config/index.js";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const plugin: FastifyPluginAsyncZod = async function (fastify) {
  fastify.route({
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
};

export default plugin;
