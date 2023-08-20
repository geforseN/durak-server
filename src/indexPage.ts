import type { SocketStream } from "@fastify/websocket";
import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyInstance } from ".";
import assert from "node:assert";
import crypto from "node:crypto";
import prisma from "../prisma";
import { CustomWebsocketEvent, SocketsStore } from "./ws";

declare module "fastify" {
  interface Session {
    user: Awaited<ReturnType<typeof createAnonymousUser>>;
    userProfile: Awaited<ReturnType<typeof createAnonymousUser>>["profile"];
    isAnonymous: boolean;
  }
}

export async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const context = { requestId: request.id, session: request.session };
  const log = this.log.child(context);
  this.log.info({ isSessionModified: request.session.isModified });
  if (!request.session.isAnonymous) {
    await mutateSessionWith(await createAnonymousUser(log), request, log);
  } else {
    this.log.info("session exist in store");
  }
  this.log.info("sendFile index.html");
  return reply.type("text/html").sendFile("index.html");
}

export default async function indexPage(fastify: FastifyInstance) {
  const socketsStore = new SocketsStore();

  fastify.route({
    method: "GET",
    url: "/",
    handler,
    wsHandler: async function wsHandler(connection, request) {
      socketsStore.add(connection.socket);
      const userRoom = socketsStore
        .room(request.session.user.id)
        .add(connection.socket);
      const context = { requestId: request.id, session: request.session };
      const log = this.log.child(context);
      this.log.info("WebSocket: / NEW");
      if (
        userRoom.hasOneSocket &&
        request.session.user.profile?.connectStatus === "OFFLINE"
      ) {
        makeUserOnline(connection, request);
      }
      connection.socket.send(
        new UserProfileRestoreEvent(request.session).asString,
      );
      connection.socket.addListener("close", (_code, _reason) => {
        socketsStore.remove(connection.socket);
        userRoom.remove(connection.socket);
        if (userRoom.isEmpty) {
          makeUserOffline(request);
        }
      });
    },
  });
}

function makeUserOnline(connection: SocketStream, request: FastifyRequest) {
  assert.ok(request.session.user.profile);
  request.session.user.profile.connectStatus = "ONLINE";
  // REVIEW - maybe userProfile should not contain connectStatus
  // ? should connectStatus get removed from userProfile ?
  prisma.userProfile
    .update({
      where: {
        userId: request.session.user.id,
      },
      data: {
        connectStatus: "ONLINE",
      },
    })
    .then((user) => {
      request.session.save().then(console.log);
      connection.emit("socket", new UserConnectStatusUpdateEvent(user));
    })
    .catch((error) => {
      assert.ok(request.session.user.profile);
      request.session.user.profile.connectStatus = "OFFLINE";
      request.server.log.error({ error }, "makeUserOnline failed");
    });
}

async function makeUserOffline(request: FastifyRequest) {
  // NOTE: prisma.UserProfile will still be unchanged
  //  ? should prisma.UserProfile contain connectStatus ?
  //  ? maybe connectStatus should be session only ?
  prisma.userProfile
    .update({
      where: {
        userId: request.session.user.id,
      },
      data: {
        connectStatus: "OFFLINE",
      },
    })
    .then((userProfile) => {
      if (userProfile.connectStatus !== "OFFLINE") {
        console.error("after database update userProfile still !== OFFLINE");
      }
      request.session.user.profile?.connectStatus === "OFFLINE";
      request.session.save().then(console.log, console.error);
    })
    .catch((error) => request.server.log.error({ error }, "makeUserOffline"));
}

async function createAnonymousUser(log?: FastifyBaseLogger) {
  // сайт xsgames.co предоставляет api, которое раздает jpg изображения
  // максимальное количество изображений (в момент написания этого комментария) равно 54 (0..53)
  const int = crypto.randomInt(54);
  log?.info("start user creation");
  const { UserProfile: profile, ...user } = await prisma.user.create({
    data: {
      UserProfile: {
        create: {
          photoUrl:
            `https://xsgames.co/randomusers/assets/avatars/pixel/${int}.jpg` ||
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
  log?.info({ userProfile: profile }, "end user creation");
  return { ...user, profile, isAnonymous: true };
}

class UserProfileRestoreEvent extends CustomWebsocketEvent {
  user;

  constructor(
    session: Record<string, any>, // TODO better type,
  ) {
    super("user::profile::restore");
    this.user = session.user;
  }
}

class UserConnectStatusUpdateEvent extends CustomWebsocketEvent {
  userId;
  connectStatus;

  constructor(
    userProfile: Awaited<ReturnType<(typeof prisma)["userProfile"]["update"]>>,
  ) {
    super("user::connectStatus::update");
    this.userId = userProfile.userId;
    this.connectStatus = userProfile.connectStatus;
  }
}

async function mutateSessionWith(
  user: Awaited<ReturnType<typeof createAnonymousUser>>,
  request: FastifyRequest,
  log?: FastifyBaseLogger,
) {
  log?.info("session doesn't exist, start of anonymous session creation");
  request.session.userProfile = user.profile;
  request.session.user = user;
  request.session.isAnonymous = true;
  log?.info("session saved in RAM, start session save is store");
  await request.session.save();
  log?.info("session saved is store");
}
