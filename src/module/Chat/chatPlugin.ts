import assert from "node:assert";
import { FastifyInstance } from "fastify";
import WebSocket from "ws";
import getUser from "../../../prisma/user/getUserForChat";
import NotificationAlert from "../notification-alert";
import createMessage from "./createMessage";
import initializeChat from "./initializeChatNamespace";
import { Chat, ChatMessage } from "./entity";

export default async function chatPlugin(fastify: FastifyInstance, options: { path: string }) {
  const getChatContext = initializeChat();
  return fastify.get(options.path, { websocket: true }, async function(connection, request) {
    const context = getChatContext(connection, request);
    context.socket.emit("socketOnce", "history__restore", context.chat.cache);
    context.socket.on("message__send", onMessageSendListener.bind(context));
  });
}

async function onMessageSendListener(
  this: {
    socket: WebSocket,
    userId: string,
    chat: Chat,
  },
  text: string,
  replyMessageId: string | undefined,
) {
  try {
    await sendMessageInChatHandler.call(this, { text, replyMessageId });
  } catch (error) {
    handleError(error, this.socket);
  }
}

async function sendMessageInChatHandler(
  this: {
    socket: WebSocket
    userId: string,
    chat: Chat,
  },
  { text, replyMessageId }: { text: string, replyMessageId?: string },
) {
  ChatMessage.ensureCorrectTextLength(text);
  assert.ok(this.userId, "Вы не можете отправить сообщение");
  const sender = await getUser(this.userId);
  this.chat.addMessage(createMessage({ sender, text, replyMessageId }), this.socket);
}

function handleError(error: unknown, socket: WebSocket) {
  if (error instanceof Error) {
    socket.emit("socket", "notification__send", new NotificationAlert().fromError(error));
  } else {
    console.log("GlobalChat Error:", error);
  }
}
