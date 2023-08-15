import { FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import { Chat } from "./entity";
import { SocketsStore, defaultListeners } from "../../ws";

export default function initializeChat() {
  const socketsStore = new SocketsStore();
  const chat = new Chat({ socketsStore });

  return function getChatContext(
    connection: SocketStream,
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
