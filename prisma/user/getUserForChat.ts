import prisma from "../index";

// TODO - delete me
export default async function getChatSender(userId: string) {
  return prisma.userProfile
    .findUniqueOrThrow({
      where: { userId },
      select: {
        userId: true,
        personalLink: true,
        photoUrl: true,
        nickname: true,
        connectStatus: true,
        User: { select: { currentGameId: true } },
      },
    })
    .then((data) => ({
      ...data,
      id: userId,
      currentGameId: data.User.currentGameId,
    }));
}

export type ChatMessageSender = Awaited<ReturnType<typeof getChatSender>>;
