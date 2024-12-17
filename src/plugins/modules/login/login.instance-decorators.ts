import assert from "node:assert";
import crypto from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  UserSchema,
  UserProfileSchema,
} from "../../../../prisma/schema/generated/zod/index.js";
import type { z } from "zod";

const SessionSchema = UserSchema.extend({
  profile: UserProfileSchema,
});

export type SessionUser = z.infer<typeof SessionSchema>;

declare module "fastify" {
  interface FastifyInstance {
    mutateSession: typeof mutateSession;
    createAnonymousUser: typeof createAnonymousUser;
    saveSessionInStore: typeof saveSessionInStore;
    createUserChildLog: typeof createUserChildLog;
    createUserAndLogger: typeof createUserAndLogger;
  }

  interface Session {
    user?: SessionUser;
  }
}

export function decorate(app: FastifyInstance) {
  app.decorate("mutateSession", mutateSession);
  app.decorate("createAnonymousUser", createAnonymousUser);
  app.decorate("saveSessionInStore", saveSessionInStore);
  app.decorate("createUserChildLog", createUserChildLog);
  app.decorate("createUserAndLogger", createUserAndLogger);
}

export function mutateSession(
  this: FastifyInstance,
  request: FastifyRequest,
  user: SessionUser,
  log = this.log,
) {
  request.session.user = user;
  log.debug("anonymous user saved in request.session");
}

export async function saveSessionInStore(
  this: FastifyInstance,
  request: FastifyRequest,
  log = this.log,
) {
  log.debug("started anonymous user save is sessionStore");
  await request.session.save();
  log.debug("anonymous user saved is store");
}

function createAnonymousUserPhotoUrl() {
  const randomInt = crypto.randomInt(54);
  // сайт xsgames.co предоставляет api, которое раздает jpg изображения
  // максимальное количество изображений равно 54 (0..53)
  return `https://xsgames.co/randomusers/assets/avatars/pixel/${randomInt}.jpg`;
}

export async function createAnonymousUser(this: FastifyInstance) {
  this.log.trace("started anonymous user creation");
  const photoUrl = createAnonymousUserPhotoUrl();
  const { UserProfile: profile, ...user } = await this.prisma.user.create({
    data: {
      UserProfile: {
        create: {
          photoUrl,
          nickname: "Anonymous",
        },
      },
      UserGameStat: { create: {} },
    },
    include: {
      UserProfile: true,
    },
  });
  assert.ok(
    profile &&
      profile.photoUrl &&
      user.email === null &&
      user.currentGameId === null,
  );
  return {
    ...user,
    profile,
    isAnonymous: true,
  };
}

export function createUserChildLog(this: FastifyInstance, user: SessionUser) {
  return this.log.child({
    userId: user.id,
    personalLink: user.profile.personalLink,
  });
}

export async function createUserAndLogger(
  this: FastifyInstance,
  createUser: () => Promise<SessionUser>,
) {
  const user = await createUser();
  SessionSchema.parse(user);
  const log = createUserChildLog.call(this, user);
  log.trace("user created");
  return { user, log };
}
