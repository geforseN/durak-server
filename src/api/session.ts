import crypto from "node:crypto";
import assert from "node:assert";

import type { FastifyBaseLogger, FastifyRequest } from "fastify";

import { type FastifyInstanceT, prisma } from "../config/index.js";

export function sessionApi(fastify: FastifyInstanceT) {
  return fastify.route({
    method: "GET",
    url: "/api/session-test123",
    async handler(request) {
      const context = { requestId: request.id, session: request.session };
      const log = this.log.child(context);
      this.log.info({ isSessionModified: request.session.isModified });
      if (!request.session.isAnonymous) {
        await mutateSessionWithAnonymousUser(request, log);
      } else {
        this.log.info("session exist in store");
      }
      return request.session;
    },
  });
}

async function mutateSessionWithAnonymousUser(
  request: FastifyRequest,
  log?: FastifyBaseLogger,
) {
  const user = await createAnonymousUser(log);
  request.session.user = user;
  request.session.isAnonymous = true;
  log?.debug("session saved in RAM, start session save is store");
  await request.session.save();
  log?.debug("session saved is store");
}

async function createAnonymousUser(log?: FastifyBaseLogger) {
  // сайт xsgames.co предоставляет api, которое раздает jpg изображения
  // максимальное количество изображений (в момент написания этого комментария) равно 54 (0..53)
  const randomInt = crypto.randomInt(54);
  log?.debug("start createAnonymousUser");
  const { UserProfile: profile, ...user } = await prisma.user.create({
    data: {
      UserProfile: {
        create: {
          photoUrl:
            `https://xsgames.co/randomusers/assets/avatars/pixel/${randomInt}.jpg` ||
            "https://cdn.7tv.app/emote/6306876cbe8c19d70f9d6b22/4x.webp",
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
  log?.debug({ userProfile: profile }, "end createAnonymousUser");
  return { ...user, profile, isAnonymous: true };
}
