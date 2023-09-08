import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ReleasedAuthProviderKey = "githubId" | "vkId";

export function getUpdatedUserWithNewAuthProvider<
  ProviderName extends any, // TODO fix type
>({
  userId,
  authProviderIdValue,
  authProviderKey,
}: {
  userId: string;
  authProviderIdValue: number | string; // FIXME want to use like UserAuthInfoPayload["scalars"][ProviderName],
  authProviderKey: keyof ProviderName;
}) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      UserAuthInfo: {
        update: {
          [authProviderKey]: authProviderIdValue,
        },
      },
    },
    include: { UserAuthInfo: true, UserProfile: true },
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { UserAuthInfo: true, UserProfile: true },
  });
}

export function findUserWithAuthProvider<
  ProviderName extends any, // TODO fix type
>({
  authProviderIdValue,
  authProviderKey,
}: {
  authProviderIdValue: number | string; // FIXME want to use like UserAuthInfoPayload["scalars"][ProviderName],
  authProviderKey: keyof ProviderName;
}) {
  return prisma.user.findFirst({
    where: {
      UserAuthInfo: {
        [authProviderKey]: authProviderIdValue,
      },
    },
    include: { UserProfile: true },
  });
}
