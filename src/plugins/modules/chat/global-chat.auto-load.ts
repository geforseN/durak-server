import {
  CustomWebsocketEvent,
  NotificationAlertEvent,
} from "../../../ws/index.js";
import createMessage from "../../../module/Chat/createMessage.js";
import type {
  Chat,
  ChatMessage,
  ChatReplyMessage,
} from "../../../module/Chat/entity/index.js";
import initializeChat from "../../../module/Chat/initializeChatNamespace.js";

export type ChatContext = ReturnType<ReturnType<typeof initializeChat>>;

export const autoConfig = { path: "/global-chat" };

export default <FastifyPluginAsyncZod<{ path: string }>>(
  async function (app, options) {
    const getChatContext = initializeChat();
    app.get(
      options.path,
      { websocket: true },
      async function (socket, request) {
        const context = getChatContext(socket, request);
        socket.send(new ChatRestoreEvent(context.chat).asString);
        socket.on("message::send", onMessageSendListener.bind(context));
      },
    );
  }
);

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
