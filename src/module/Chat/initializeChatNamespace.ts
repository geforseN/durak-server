import type { WebSocket } from "@fastify/websocket";
import type { FastifyRequest } from "fastify";
import { SocketsStore, defaultListeners } from "@/ws/index.js";
import { Chat } from "@/module/Chat/entity/index.js";

export default function initializeChat() {
  const socketsStore = new SocketsStore();
  const chat = new Chat({ socketsStore });

  return function getChatContext(socket: WebSocket, request: FastifyRequest) {
    socketsStore.add(socket);
    socketsStore.room(request.session.user.id).add(socket);
    socket
      .addListener("socket", defaultListeners.socket)
      .addListener("message", defaultListeners.message);
    return {
      sender: request.session.user,
      socket,
      chat,
      socketsStore,
    };
  };
}
