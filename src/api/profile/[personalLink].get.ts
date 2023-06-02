import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function getUserProfile(fastify: FastifyInstance) {
  return fastify.get("/profile", async function(request, reply) {
    const { personalLink } = request.query as { personalLink: string };
    if (!personalLink) throw new Error("Не указана ссылка пользователя");
    const user = await prisma.userProfile.findFirst({
      where: { personalLink },
      select: {
        nickname: true,
        connectStatus: true,
        photoUrl: true,
      },
    });
    if (!user) throw new Error("Нет доступа");
    return reply.send(user);
  });
}
