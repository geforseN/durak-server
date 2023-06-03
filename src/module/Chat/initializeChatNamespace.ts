import { randomUUID } from "crypto";
import WebSocket from "ws";
import { Chat } from "./entity";
import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import assert from "node:assert";

export default function initializeChat() {
  type UserId = string | ReturnType<typeof randomUUID>
  const userSockets = new Map<UserId, Set<WebSocket>>();
  const sockets = <WebSocket[]>[];
  const globalChat = new Chat();

  function handleConnection(connection: SocketStream, request: FastifyRequest) {
    sockets.push(connection.socket);
    const { userId } = request.session.userProfile;
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set([connection.socket]));
    } else {
      userSockets.get(userId)?.add(connection.socket);
    }

    connection.socket.on(
      "socket",
      (eventName: "history__restore" | "notification__send", ...payload: any[]) => {
        connection.socket.send(JSON.stringify({ eventName, payload }));
      },
    );

    connection.socket.on(
      "everySocket",
      (eventName: "message__send", ...payload: any[]) => {
        const message = JSON.stringify({ eventName, payload });
        sockets.forEach((socket) => {
          socket.send(message);
        });
      },
    );

    connection.socket.onmessage = (event) => {
      assert.ok(typeof event.data === "string");
      const { eventName, payload } = JSON.parse(event.data);
      connection.socket.emit(eventName, ...payload);
    };
  }

  return {
    globalChat,
    handleConnection,
  };
}