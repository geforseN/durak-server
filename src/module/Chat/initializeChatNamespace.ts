import { FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import { Chat } from "./entity";
import { SocketsStore, defaultListeners } from "../../ws";

export default function initializeChat() {
  const chat = new Chat();
  const socketsStore = new SocketsStore();

  return function getChatContext(
    connection: SocketStream,
    request: FastifyRequest,
  ) {
    socketsStore.add(connection.socket);
    socketsStore
      .room(request.session.userProfile.userId)
      .add(connection.socket);
    connection.socket
      .addListener("everySocket", socketsStore.emitSockets)
      .addListener("socket", defaultListeners.socket)
      .addListener("message", defaultListeners.message);
    return {
      sender: {
        ...request.session.userProfile,
        userProfile: request.session.userProfile,
        id: request.session.userProfile.userId,
      },
      userId: request.session.userProfile.userId,
      socket: connection.socket,
      chat,
    };
  };
}
