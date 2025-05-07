import z from "zod";
import assert from "node:assert";
import type { PrismaClient } from "@prisma/client";

async function getUserProfile(prisma: PrismaClient, personalLink: string) {
  const { User, ...profile } = await prisma.userProfile.findFirstOrThrow({
    where: { personalLink },
    select: {
      nickname: true,
      connectStatus: true,
      photoUrl: true,
      User: { include: { UserGameStat: true } },
    },
  });
  const { UserGameStat, ...user } = User;
  assert.ok(UserGameStat !== null);
  const { userId, ...gameStat } = UserGameStat;
  return {
    ...profile,
    user: {
      ...user,
      gameStat,
    },
  };
}

export type UserProfile = Awaited<ReturnType<typeof getUserProfile>>;

export default <FastifyPluginAsyncZod>async function (app) {
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
