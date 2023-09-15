import type { SocketStream } from "@fastify/websocket";
import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { type SingletonFastifyInstance } from "./index.js";
import durakGamesStore from "./common/durakGamesStore.js";
import assert from "node:assert";
import crypto from "node:crypto";
import prisma from "../prisma/index.js";
import { CustomWebsocketEvent, SocketsStore } from "./ws/index.js";
import { User, UserProfile } from "@prisma/client";

declare module "fastify" {
  interface Session {
    user: User & { profile: UserProfile };
    isAnonymous: boolean;
  }
}

export async function handler(
  this: SingletonFastifyInstance,
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

export default async function indexPage(fastify: SingletonFastifyInstance) {
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
      this.log.info("WebSocket: / NEW");
      if (
        userRoom.hasOneSocket &&
        request.session.user.profile?.connectStatus === "OFFLINE"
      ) {
        makeUserOnline(connection, request, socketsStore);
      }
      connection.socket.send(
        new UserRestoreEvent(request.session.user).asString,
      );
      connection.socket.send(new DurakGameStateRestoreEvent().asString);
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

function makeUserOnline(
  connection: SocketStream,
  request: FastifyRequest,
  socketsStore: SocketsStore,
) {
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
    .then((userProfile) => {
      request.session.save().then(() => {
        request.server.log.info("makeUserOnline succeeded");
      });
      socketsStore.emit(new UserConnectStatusUpdateEvent(userProfile));
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
      assert.ok(request.session.user.profile);
      request.session.user.profile.connectStatus = "OFFLINE";
      request.session.save().then(
        () => {
          request.server.log.info("makeUserOffline succeeded");
        },
        (error) => {
          throw error;
        },
      );
    })
    .catch((error) =>
      request.server.log.error({ error }, "makeUserOffline failed"),
    );
}

// TODO use for photoUrl https://7tv.io/docs
async function createAnonymousUser(log?: FastifyBaseLogger) {
  // сайт xsgames.co предоставляет api, которое раздает jpg изображения
  // максимальное количество изображений (в момент написания этого комментария) равно 54 (0..53)
  const int = crypto.randomInt(54);
  log?.debug("start createAnonymousUser");
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
  log?.debug({ userProfile: profile }, "end createAnonymousUser");
  return { ...user, profile, isAnonymous: true };
}

class UserRestoreEvent extends CustomWebsocketEvent {
  user;

  constructor(user: User) {
    super("user::restore");
    this.user = user;
  }
}

// NOTE - frontend does not listen this event
// TODO - should update event related logic
class UserConnectStatusUpdateEvent extends CustomWebsocketEvent {
  userId;
  connectStatus;

  constructor(userProfile: UserProfile) {
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
  request.session.user = user;
  request.session.isAnonymous = true;
  log?.debug("session saved in RAM, start session save is store");
  await request.session.save();
  log?.debug("session saved is store");
}

class DurakGameStateRestoreEvent extends CustomWebsocketEvent {
  startedGames;

  constructor() {
    super("durakGames::restore");
    this.startedGames = durakGamesStore.startedGammakeesState;
  }
}
