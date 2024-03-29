import type { FastifyBaseLogger, FastifyRequest } from "fastify";
import { z } from "zod";
import crypto from "node:crypto";
import assert from "node:assert";

import type { FastifyInstanceT } from "../../app.js";
import { prisma } from "../../config/index.js";
import { stringToBoolean } from "../../common/index.js";

export async function createUser(fastify: FastifyInstanceT) {
  return fastify.route({
    method: "POST",
    url: "/api/auth/login",
    schema: {
      querystring: z.object({
        anonymous: z.string().transform(stringToBoolean),
        dev: z.string().transform(stringToBoolean),
      }),
    },
    async handler(request, reply) {
      console.log({ anon: request.query.anonymous });
      if (typeof request.session.user?.isAnonymous === "undefined") {
        await mutateSessionWithAnonymousUser(request, this.log);
      }
      return reply.redirect(
        request.query.dev
          ? "http://localhost:5173"
          : "https://play-durak.vercel.app",
      );
    },
  });
}

export async function mutateSessionWithAnonymousUser(
  request: FastifyRequest,
  log?: FastifyBaseLogger,
) {
  const user = await createAnonymousUser(log);
  request.session.user = user;
  log?.info(
    request.session,
    "session saved in RAM, start session save is store",
  );
  await request.session.save();
  log?.info(request.session, "session saved is store");
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
  log?.info({ userProfile: profile }, "end createAnonymousUser");
  return { ...user, profile, isAnonymous: true };
}
