import { FastifyInstance, FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import assert from "node:assert";
import getUser from "../../../prisma/user/getUserForChat";
import NotificationAlert from "../notification-alert";
import { ChatMessage } from "./entity";
import createMessage from "./createMessage";
import initializeChat from "./initializeChatNamespace";


export default async function chatNamespace(fastify: FastifyInstance) {
  const { globalChat, handleConnection } = initializeChat();
  return fastify.get("/global-chat", { websocket: true }, async function(connection: SocketStream, request: FastifyRequest) {
    handleConnection(connection, request);
    connection.socket.emit("socket", "history__restore", globalChat.cache);
    connection.socket.on("message__send", async function(text, replyMessageId) {
      try {
        ChatMessage.ensureCorrectTextLength(text);
        assert.ok(request.session.userProfile.userId, "Вы не можете отправить сообщение");
        const sender = await getUser(request.session.userProfile.userId);
        globalChat.addMessage(createMessage({ sender, text, replyMessageId }), this);
      } catch (error) {
        handleError(error, connection);
      }
    });
  });
}


function handleError(error: unknown, connection: SocketStream) {
  if (error instanceof Error) {
    connection.socket.emit("socket", "notification__send", new NotificationAlert().fromError(error));
  } else {
    console.log("GlobalChat Error:", error);
  }
}
