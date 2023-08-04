import WebSocket from "ws";
import ChatMessage from "./ChatMessage";
import ChatReplyMessage from "./ChatReplyMessage";
import { ChatMessageEvent } from "../chatPlugin";

export default class Chat {
  readonly #messages: ChatMessage[];
  readonly #maxMessages: number;

  constructor({
    maxMessages = 100,
    messages = [],
  }: Partial<{
    maxMessages: number;
    messages: ChatMessage[];
  }> = {}) {
    this.#maxMessages = maxMessages;
    this.#messages = messages;
  }

  get cache() {
    return [...this.#messages];
  }

  addMessage(message: ChatMessage | ChatReplyMessage, socket: WebSocket) {
    if (message instanceof ChatReplyMessage) {
      this.#ensureSenderCanReply(message);
    }
    if (this.#messages.length === this.#maxMessages) {
      this.#messages.shift();
    }
    this.#messages.push(message);
    socket.emit("everySocket", new ChatMessageEvent(message));
  }

  #ensureSenderCanReply({ replyMessageId }: ChatReplyMessage) {
    if (
      [...this.#messages]
        .reverse()
        .every((message) => replyMessageId !== message.id)
    ) {
      throw new Error(
        "Сообщение, на которое вы отправили ответ, не было найдено",
      );
    }
  }
}
