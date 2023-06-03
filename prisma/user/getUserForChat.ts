import prisma from "../index";

export default async function getUserForChat(userId: string) {
  return prisma.userProfile.findUniqueOrThrow({
    where: { userId },
    select: {
      userId: true,
      personalLink: true,
      photoUrl: true,
      nickname: true,
      connectStatus: true,
      User: { select: { currentGameId: true } },
    },
  });
}
