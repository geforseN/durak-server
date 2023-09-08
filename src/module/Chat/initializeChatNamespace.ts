import type { SocketStream } from "@fastify/websocket";
import type { FastifyRequest } from "fastify";
import type { WebSocket } from "ws";
import {
  SocketsStore,
  defaultListeners,
  type CustomWebsocketEvent,
} from "../../ws/index.js";
import { Chat } from "./entity/index.js";

export interface AdditionalListeners {
  addListener(
    event: "socket",
    listener: (this: WebSocket, event: CustomWebsocketEvent) => void,
  ): this;
  on(
    event: "socket",
    listener: (this: WebSocket, event: CustomWebsocketEvent) => void,
  ): this;
}

export default function initializeChat() {
  const socketsStore = new SocketsStore();
  const chat = new Chat({ socketsStore });

  return function getChatContext(
    connection: SocketStream & { socket: WebSocket & AdditionalListeners },
    request: FastifyRequest,
  ) {
    socketsStore.add(connection.socket);
    socketsStore.room(request.session.user.id).add(connection.socket);
    connection.socket
      .addListener("socket", defaultListeners.socket)
      .addListener("message", defaultListeners.message);
    return {
      sender: request.session.user,
      socket: connection.socket,
      chat,
      socketsStore,
    };
  };
}
