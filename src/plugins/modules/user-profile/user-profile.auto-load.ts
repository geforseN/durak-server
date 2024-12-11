import z from "zod";
import assert from "node:assert";
import type { PrismaClient } from "@prisma/client";

export default <FastifyPluginAsyncZod>async function (app) {
  async function getUserProfile(prisma: PrismaClient, personalLink: string) {
    const user = await prisma.userProfile.findFirst({
      where: { personalLink },
      select: {
        nickname: true,
        connectStatus: true,
        photoUrl: true,
        User: { include: { UserGameStat: true } },
      },
    });
    assert.ok(user, "No access");
    return user;
  }

  const schema = {
    params: z.object({
      linkCuid: z.string(),
    }),
  };

  app.get("/profiles/:linkCuid", { schema }, async function (request) {
    return await getUserProfile(this.prisma, request.params.linkCuid);
  });
  app.get("/user/profiles/:linkCuid", { schema }, async function (request) {
    return await getUserProfile(this.prisma, request.params.linkCuid);
  });
};

export const autoPrefix = "/api";
