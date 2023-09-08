import prisma from "../../../prisma/index.js";
import { type SingletonFastifyInstance } from "../../index.js";
import z from "zod";

export default function getUserProfile(fastify: SingletonFastifyInstance) {
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
    handler: async function (request, reply) {
      const user = await prisma.userProfile.findFirst({
        where: { personalLink: request.query.personalLink },
        select: {
          nickname: true,
          connectStatus: true,
          photoUrl: true,
          User: { include: { UserGameStat: true } },
        },
      });
      if (!user) {
        // Пользователь не был найдем, но
        // для безопасности просто отправим "Нет доступа"
        throw new Error("Нет доступа");
      }
      return reply.send(user);
    },
  });
}
