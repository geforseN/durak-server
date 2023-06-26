import { randomUUID } from "crypto";
import { FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import WebSocket from "ws";
import { Chat } from "./entity";
import {
  dispatchMessageToCertainListener,
  emitSocketOnce,
  emitEverySocketOn,
  emitSocketOn,
  addUserSocketInRoom,
} from "../../ws";

export default function initializeChat() {
  type UserId = string | ReturnType<typeof randomUUID>
  const userSockets = new Map<UserId, Set<WebSocket>>();
  const sockets = <WebSocket[]>[];
  const globalChat = new Chat();

  return function getChatContext(connection: SocketStream, request: FastifyRequest) {
    sockets.push(connection.socket);
    addUserSocketInRoom.call({ userSockets }, connection.socket, request.session.userProfile.userId);
    dispatchMessageToCertainListener(connection.socket);
    emitSocketOn<"notification__send">(connection.socket);
    emitSocketOnce<"history__restore">(connection.socket);
    emitEverySocketOn<"message__send">(connection.socket, sockets);
    return {
      userId: request.session.userProfile.userId,
      socket: connection.socket,
      chat: globalChat,
    };
  };
}
