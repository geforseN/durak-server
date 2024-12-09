import type { FastifyInstance, FastifyRequest } from "fastify";
import assert from "node:assert";
import crypto from "node:crypto";

declare module "fastify" {
  interface FastifyInstance {
    mutateSessionWithAnonymousUser: typeof mutateSessionWithAnonymousUser;
    createAnonymousUser: typeof createAnonymousUser;
  }
}

export async function mutateSessionWithAnonymousUser(
  this: FastifyInstance,
  request: FastifyRequest,
) {
  const user = await this.createAnonymousUser();
  request.session.user = user;
  this.log.info(
    request.session,
    "session saved in RAM, start session save is store",
  );
  await request.session.save();
  this.log.info(request.session, "session saved is store");
}

export async function createAnonymousUser(this: FastifyInstance) {
  // сайт xsgames.co предоставляет api, которое раздает jpg изображения
  // максимальное количество изображений (в момент написания этого комментария) равно 54 (0..53)
  const randomInt = crypto.randomInt(54);
  this.log.debug("start createAnonymousUser");
  const { UserProfile: profile, ...user } = await this.prisma.user.create({
    data: {
      UserProfile: {
        create: {
          photoUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${randomInt}.jpg`,
          nickname: "Anonymous",
        },
      },
      UserGameStat: { create: {} },
    },
    include: {
      UserProfile: true,
    },
  });
  assert.ok(profile && profile.photoUrl, "TypeScript");
  assert.ok(user.email === null && user.currentGameId === null);
  this.log.info({ userProfile: profile }, "end createAnonymousUser");
  return { ...user, profile, isAnonymous: true };
}
