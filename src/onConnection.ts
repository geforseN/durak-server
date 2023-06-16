import { FastifyInstance, FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import prisma from "../prisma";

export default async function onConnection(fastify: FastifyInstance) {
  fastify.get("/", { websocket: true }, async (connection, request) => {
    handleUserConnect(request);
    sendUserProfile(connection, request);
    connection.socket.onclose = (_event) => {
      handleUserDisconnect(request);
    };
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
