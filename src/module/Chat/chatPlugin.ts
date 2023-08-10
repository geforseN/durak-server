import { type FastifyInstance } from "fastify";
import assert from "node:assert";
import type WebSocket from "ws";
import NotificationAlert from "../notification-alert";
import createMessage from "./createMessage";
import { Chat, ChatMessage, ChatReplyMessage } from "./entity";
import initializeChat from "./initializeChatNamespace";
import { CustomWebsocketEvent } from "../../ws";

export type ChatContext = ReturnType<ReturnType<typeof initializeChat>>

export default async function chatPlugin(
  fastify: FastifyInstance,
  options: { path: string },
) {
  const getChatContext = initializeChat();
  return fastify.get(
    options.path,
    { websocket: true },
    async function (connection, request) {
      const context = getChatContext(connection, request);
      context.socket.emit("socket", new ChatRestoreEvent(context.chat));
      context.socket.on("message::send", onMessageSendListener.bind(context));
    },
  );
}

async function onMessageSendListener(
  this: ChatContext,
  { text, replyMessageId }: { text: string; replyMessageId?: string },
) {
  try {
    await sendMessageInChatHandler.call(this, { text, replyMessageId });
  } catch (error) {
    handleError(error, this.socket);
  }
}

async function sendMessageInChatHandler(
  this: ChatContext,
  { text, replyMessageId }: { text: string; replyMessageId?: string },
) {
  ChatMessage.ensureCorrectTextLength(text);
  this.chat.addMessage(
    createMessage({ sender: this.sender, text, replyMessageId }),
    this.socket,
  );
}

function handleError(error: unknown, socket: WebSocket) {
  if (error instanceof Error) {
    socket.emit("socket", new NotificationAlertEvent(error));
  } else {
    console.log("GlobalChat Error:", error);
  }
}

class NotificationAlertEvent extends CustomWebsocketEvent {
  notificationAlert;

  constructor(error: Error) {
    super("notification::push");
    this.notificationAlert = new NotificationAlert(error);
  }
}

export class ChatMessageEvent extends CustomWebsocketEvent {
  message;

  constructor(message: ChatMessage | ChatReplyMessage) {
    super("message::send");
    this.message = message;
  }
}

class ChatRestoreEvent extends CustomWebsocketEvent {
  cache;

  constructor(chat: Chat) {
    super("chat::restore");
    this.cache = chat.cache;
  }
}
