import { type FastifyInstance } from "fastify";
import {
  CustomWebsocketEvent,
  NotificationAlertEvent,
} from "../../ws/index.js";
import createMessage from "./createMessage.js";
import type { Chat, ChatMessage, ChatReplyMessage } from "./entity/index.js";
import initializeChat from "./initializeChatNamespace.js";

export type ChatContext = ReturnType<ReturnType<typeof initializeChat>>;

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
      context.socket.send(new ChatRestoreEvent(context.chat).asString);
      context.socket.on("message::send", onMessageSendListener.bind(context));
    },
  );
}

async function onMessageSendListener(
  this: ChatContext,
  { text, replyMessageId }: { text: string; replyMessageId?: string },
) {
  try {
    this.chat.ensureCorrectLength(text);
    this.chat.addMessage(
      createMessage({ sender: this.sender, text, replyMessageId }),
    );
  } catch (error) {
    if (!(error instanceof Error)) {
      return console.log("GlobalChat Error:", error);
    }
    this.socket.send(new NotificationAlertEvent(error).asString);
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
