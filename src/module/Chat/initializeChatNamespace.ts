import { randomUUID } from "crypto";
import { FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import WebSocket from "ws";
import { Chat } from "./entity";
import {
  dispatchMessageToCertainListener as addMessageDispatchToCertainListener,
  addUserSocketInRoom,
  WebsocketEvent,
} from "../../ws";

export default function initializeChat() {
  type UserId = string | ReturnType<typeof randomUUID>;
  const userSockets = new Map<UserId, Set<WebSocket>>();
  const sockets = <WebSocket[]>[];
  const globalChat = new Chat();

  return function getChatContext(
    connection: SocketStream,
    request: FastifyRequest,
  ) {
    sockets.push(connection.socket);
    addUserSocketInRoom.call(
      { userSockets },
      connection.socket,
      request.session.userProfile.userId,
    );
    connection.socket.on("everySocket", (event: WebsocketEvent) => {
      const message = event.asString;
      sockets.forEach((socket) => socket.send(message));
    });
    connection.socket.on("socket", (event: WebsocketEvent) => {
      connection.socket.send(event.asString);
    });
    addMessageDispatchToCertainListener(connection.socket);
    return {
      sender: {
        ...request.session.userProfile,
        id: request.session.userProfile.userId,
      },
      userId: request.session.userProfile.userId,
      socket: connection.socket,
      chat: globalChat,
    };
  };
}
