import { PrismaClient } from "@prisma/client";
import { LobbyUserIdentifier } from "../src/namespaces/lobbies/entity/lobby-users";

const prisma = new PrismaClient();

export const xprisma = prisma.$extends({
  model: {
    user: {
      async findOrThrow({ accname }: LobbyUserIdentifier) {
        return await prisma.user.findUniqueOrThrow({
          where: { accname },
          select: {
            accname: true,
            nickname: true,
            connectStatus: true,
            photoUrl: true,
            personalLink: true,
          },
        });
      },
    },
  },
});

export type XPrismaClient = typeof xprisma;
