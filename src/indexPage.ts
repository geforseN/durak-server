import fastify, { FastifyInstance, FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import prisma from "../prisma";
import { WebsocketEvent } from "./ws";
import type WebSocket from "ws";
import { raise } from ".";
import assert from "node:assert";
import crypto from "node:crypto";

export default async function indexPage(fastify: FastifyInstance) {
  const socketsStore = new SocketsStore();
  fastify.route({
    method: "GET",
    url: "/",
    handler: async function handler(request, reply) {
      this.log.child({ requestId: request.id }).info("HTML: GET /");
      if (!request.session.isAnonymous) {
        const { UserProfile } = await getShortLiveAnonymousUser.call(
          this,
          request,
        );
        this.log.info({ UserProfile });
        request.session.userProfile = UserProfile || raise();
        request.session.isAnonymous = true;
        this.log
          .child({ requestId: request.id, session: request.session })
          .info("session save");
        await request.session.save();
        this.log
          .child({ requestId: request.id, session: request.session })
          .info("session saved");
      } else {
        this.log.child({ session: request.session }).info("session exist");
      }
      this.log.child({ requestId: request.id }).info("sendFile index.html");
      return reply.type("text/html").sendFile("index.html");
    },
    wsHandler: async function wsHandler(connection, request) {
      socketsStore.add(connection.socket);
      this.log.child({ requestId: request.id }).info("WebSocket: / NEW");
      subscribeToEvents(connection, request, socketsStore);
      updateConnectionStatus(connection, request);
      if (!request.session.userProfile) {
        connection.socket.removeAllListeners();
        return request.server.log.error("sendUserProfile");
      }
      connection.socket.emit(
        "socket",
        new UserProfileRestoreEvent(request.session.userProfile),
      );
      connection.socket.onclose = () => {
        socketsStore.delete(connection.socket);
        if (!request.session.userProfile) {
          return request.server.log.error(
            "handleUserDisconnect: no userProfile in session",
          );
        }
        if (request.session.userProfile.connectStatus === "ONLINE") {
          setTimeout(makeUserOffline, 5_000, request);
        }
      };
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

async function getShortLiveAnonymousUser(
  this: FastifyInstance,
  request: FastifyRequest,
) {
  this.log.warn("No Session");
  this.log
    .child({ requestId: request.id })
    .debug("start shortLiveAnonymousUser creation");
  const shortLiveAnonymousUser = await prisma.user.create({
    data: {
      UserProfile: {
        create: {
          // сайт xsgames.co предоставляет api, которое раздает jpg изображения
          // максимальное количество изображений (в момент написания этого комментария) равно 55 (0..54)
          photoUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${crypto.randomInt(
            54,
          )}.jpg`,
          nickname: "Anonymous",
        },
      },
    },
    select: {
      UserProfile: true,
    },
  });
  this.log
    .child({ requestId: request.id })
    .debug("end shortLiveAnonymousUser creation");
  return shortLiveAnonymousUser;
}

class UserProfileRestoreEvent extends WebsocketEvent {
  userProfile;

  constructor(
    userProfile: Awaited<ReturnType<(typeof prisma)["userProfile"]["update"]>>,
  ) {
    super("user::profile::restore");
    this.userProfile = userProfile;
  }
}

class UserConnectStatusUpdateEvent extends WebsocketEvent {
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

class SocketsStore {
  sockets: WebSocket[] = [];

  add(socket: WebSocket) {
    this.sockets.push(socket);
  }

  emitSockets(message: string) {
    this.sockets.forEach((socket) => socket.send(message));
  }

  delete(socket: WebSocket) {
    const index = this.sockets.indexOf(socket);
    assert.ok(index > 0);
    this.sockets.splice(index, 1);
  }
}

function subscribeToEvents(
  connection: SocketStream,
  request: FastifyRequest,
  socketsStore: SocketsStore,
) {
  connection.socket.on("everySocket", (event: WebsocketEvent) => {
    request.server.log
      .child({
        requestId: request.id,
        eventAsString: event.asString,
        event,
      })
      .info(
        "everySocket send",
        request.id,
        event.constructor.name,
        event.asString,
      );
    socketsStore.emitSockets(event.asString);
  });
  connection.socket.on("socket", (event: WebsocketEvent) => {
    request.server.log
      .child({
        requestId: request.id,
        eventAsString: event.asString,
        event,
      })
      .info("socket send");
    connection.socket.send(event.asString);
  });
}

function emitEverySocket() {}
function emitSocket() {}
