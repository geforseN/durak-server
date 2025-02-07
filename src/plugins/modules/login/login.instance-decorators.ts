import assert from "node:assert";
import crypto from "node:crypto";
import {
  UserSchema,
  UserProfileSchema,
} from "@@/prisma/schema/generated/zod/index.js";
import type { z } from "zod";
import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyLogFn,
  FastifyRequest,
} from "fastify";
import type { PrismaClient } from "@prisma/client";
import type { FastifySessionObject } from "@fastify/session";

export const AnonymousSessionUserSchema = UserSchema.extend({
  profile: UserProfileSchema,
});

export type SessionUser = z.infer<typeof AnonymousSessionUserSchema>;

declare module "fastify" {
  interface FastifyInstance {
    createAnonymousSessionUser(): Promise<SessionUser>;
    createUserChildLog(user: SessionUser): FastifyBaseLogger;
  }

  interface FastifyRequest {
    hasSession(): boolean;
    mutateSession(user: SessionUser, log: FastifyLogFn): void;
    saveSessionInStore(log: FastifyLogFn): Promise<void>;
  }

  interface Session {
    user?: SessionUser;
  }
}

export function decorate(app: FastifyInstance) {
  app.decorateRequest("hasSession", hasSession);
  app.decorateRequest("mutateSession", function (user: SessionUser) {
    return mutateSession(this.session, user, this.log.trace);
  });
  app.decorateRequest("saveSessionInStore", function () {
    return saveSessionInStore(this.session, this.log.trace);
  });
  app.decorate("createAnonymousSessionUser", function () {
    this.log.trace("started anonymous user creation");
    return createAnonymousSessionUser(this.prisma);
  });
  app.decorate("createUserChildLog", function (user: SessionUser) {
    return createUserChildLog(this.log, user);
  });
}

export function mutateSession(
  session: FastifySessionObject,
  user: SessionUser,
  log: FastifyLogFn,
) {
  session.user = user;
  log("anonymous user saved in request.session");
}

export async function saveSessionInStore(
  session: FastifySessionObject,
  log: FastifyLogFn,
) {
  log("started anonymous user save is sessionStore");
  await session.save();
  log("anonymous user saved is store");
}

function createAnonymousUserPhotoUrl() {
  const randomInt = crypto.randomInt(54);
  // сайт xsgames.co предоставляет api, которое раздает jpg изображения
  // максимальное количество изображений равно 54 (0..53)
  return `https://xsgames.co/randomusers/assets/avatars/pixel/${randomInt}.jpg`;
}

export async function createAnonymousSessionUser(prisma: PrismaClient) {
  const photoUrl = createAnonymousUserPhotoUrl();
  const { UserProfile: profile, ...user } = await prisma.user.create({
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

export function createUserChildLog(log: FastifyBaseLogger, user: SessionUser) {
  return log.child({
    userId: user.id,
    personalLink: user.profile.personalLink,
  });
}

export function hasSession(this: FastifyRequest) {
  return this.session.user !== undefined;
}
