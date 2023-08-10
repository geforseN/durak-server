import { SocketStream } from "@fastify/websocket";
import type WebSocket from "ws";
import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyRequest,
} from "fastify";
import assert from "node:assert";
import crypto from "node:crypto";
import prisma from "../prisma";
import { CustomWebsocketEvent, SocketsStore, defaultListeners } from "./ws";

export default async function indexPage(fastify: FastifyInstance) {
  const socketsStore = new SocketsStore();
  fastify.route({
    method: "GET",
    url: "/",
    handler: async function handler(request, reply) {
      const context = { requestId: request.id, session: request.session };
      const log = this.log.child(context);
      log.info("HTTP: GET /");
      !request.session.isModified;
      if (!request.session.isAnonymous) {
        log.info("session doesn't exist, start of anonymous session creation");
        const userProfile = await getUserProfile(log);
        request.session.userProfile = userProfile;
        request.session.isAnonymous = true;
        log.info("session saved in RAM, start session save is store");
        await request.session.save();
        log.info("session saved is store");
      } else {
        log.info("session exist in store");
      }
      log.info("sendFile index.html");
      return reply.type("text/html").sendFile("index.html");
    },
    wsHandler: async function wsHandler(connection, request) {
      socketsStore.add(connection.socket);
      const context = { requestId: request.id, session: request.session };
      const log = this.log.child(context);
      log.info("WebSocket: / NEW");
      connection.socket.addListener(
        "everySocket",
        function (this: WebSocket, ...args: [CustomWebsocketEvent]) {
          const event = args[0];
          log.info({ event }, "WS / everySocket");
          socketsStore.emitSockets.call(this, event);
        },
      );
      connection.socket.addListener(
        "socket",
        function (this: WebSocket, event: CustomWebsocketEvent) {
          log.info({ event }, "WS / socket");
          defaultListeners.socket.call(this, event);
        },
      );
      updateConnectionStatus(connection, request);
      connection.socket.emit(
        "socket",
        new UserProfileRestoreEvent(request.session.userProfile),
      );
      connection.socket.addListener("close", (_code, _reason) => {
        socketsStore.delete(connection.socket);
        if (request.session.userProfile.connectStatus === "ONLINE") {
          setTimeout(makeUserOffline, 5_000, request);
        }
      });
    },
  });
}

function updateConnectionStatus(
  connection: SocketStream,
  request: FastifyRequest,
) {
  if (request.session.userProfile?.connectStatus === "OFFLINE") {
    request.session.userProfile.connectStatus = "ONLINE";
    prisma.userProfile
      .update({
        where: {
          userId: request.session.userProfile.userId,
        },
        data: {
          connectStatus: "ONLINE",
        },
      })
      .then((user) =>
        connection.emit("socket", new UserConnectStatusUpdateEvent(user)),
      )
      .catch((error) => {
        request.session.userProfile.connectStatus = "OFFLINE";
        request.server.log.error("makeUserOnline", error);
      });
  }
}

async function makeUserOffline(request: FastifyRequest) {
  prisma.userProfile
    .update({
      where: {
        userId: request.session.userProfile.userId,
      },
      data: {
        connectStatus: "OFFLINE",
      },
    })
    .then((userProfile) => (request.session.userProfile = userProfile))
    .catch((error) => request.server.log.error("makeUserOffline", error));
}

async function getUserProfile(log: FastifyBaseLogger) {
  // сайт xsgames.co предоставляет api, которое раздает jpg изображения
  // максимальное количество изображений (в момент написания этого комментария) равно 54 (0..53)
  const int = crypto.randomInt(54);
  const photoUrl = `https://xsgames.co/randomusers/assets/avatars/pixel/${int}.jpg`;
  log.info("start user creation");
  const { UserProfile: userProfile } = await prisma.user.create({
    data: {
      UserProfile: {
        create: { photoUrl, nickname: "Anonymous" },
      },
    },
    select: {
      UserProfile: true,
    },
  });
  assert.ok(userProfile, "TypeScript");
  log.info({ userProfile }, "end user creation");
  return userProfile;
}

class UserProfileRestoreEvent extends CustomWebsocketEvent {
  userProfile;

  constructor(
    userProfile: Awaited<ReturnType<(typeof prisma)["userProfile"]["update"]>>,
  ) {
    super("user::profile::restore");
    this.userProfile = userProfile;
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

// function withBefore(
//   decorator: Function,
//   decoratedFunc: (...args: any[]) => void,
// ) {
//   decorator();
//   return decoratedFunc;
// }

// function q(this: WebSocket, event: CustomWebsocketEvent) {
//   log.info({ event }, "socket");
//   defaultListers.socket.call(this, event);
// }
