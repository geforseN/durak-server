import { FastifyInstance, FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import prisma from "../prisma";
import assert from "node:assert";

export default async function onConnection(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/",
    handler: async function(request, reply) {
      this.log.info("start GET /");
      if (request.session.auth) {
        return this.log.info("fast end GET /");
      }
      this.log.info("Start anonymous user creation");
      // TODO сделать мало живущую сессию: по её окончанию если
      // чел не сделал логин через OAuth то удаляем его
      const user = await prisma.user.create({
        data: {
          UserProfile: {
            create: {
              photoUrl: null,
              nickname: "next TODO",
            },
          },
        },
        select: {
          UserProfile: true,
        },
      });
      assert.ok(user.UserProfile);
      request.session.set("userProfile", user.UserProfile);
      // @ts-ignore
      request.session.set("isAnonymous", true);
      await request.session.save();
      // @ts-ignore
      reply.setCookie("sessionId", request.session.sessionId, request.session.cookie);
      this.log.info("End anonymous user creation");
      this.log.info("end GET /");
      reply.redirect(process.env.FRONTEND_URL!);
    },
    wsHandler: async function(connection, request) {
      // IF NO request.session.userProfile
      // THEN {
      //   prisma.user.create with useProfile
      //     which should have:
      //     - anonymous photoUrl
      //     - random nickname
      // }
      this.log.info("handler");
      handleUserConnect(request);
      sendUserProfile(connection, request);
      connection.socket.onclose = (_event) => {
        handleUserDisconnect(request);
      };
    },
  });
}

function handleUserConnect(request: FastifyRequest) {
  if (request.session.userProfile?.connectStatus === "OFFLINE") {
    makeUserOnline(request);
  }
}

function sendUserProfile(connection: SocketStream, request: FastifyRequest) {
  connection.socket.send(JSON.stringify(request.session.userProfile));
}

function handleUserDisconnect(request: FastifyRequest) {
  if (request.session.userProfile?.connectStatus === "ONLINE") {
    setTimeout(makeUserOffline, 5_000, request);
  }
}

function makeUserOnline(request: FastifyRequest) {
  request.session.userProfile.connectStatus = "ONLINE";
  prisma.userProfile.update({
    where: {
      userId: request.session.userProfile.userId,
    }, data: {
      connectStatus: "ONLINE",
    },
  });
}

async function makeUserOffline(request: FastifyRequest) {
  request.session.userProfile = await prisma.userProfile.update({
    where: {
      userId: request.session.userProfile.userId,
    }, data: {
      connectStatus: "OFFLINE",
    },
  });
}
