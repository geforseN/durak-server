import WebSocket from "ws";
import ChatMessage from "./ChatMessage";
import ChatReplyMessage from "./ChatReplyMessage";
import { ChatMessageEvent } from "../chatPlugin";

export default class Chat {
  readonly #messages: ChatMessage[];
  readonly #maxMessages: number;
  readonly #maxMessageLength: number;
  readonly #minMessageLength: number;

  constructor({
    messages = [],
    maxMessages = 100,
    maxMessageLength = 128,
    minMessageLength = 1,
  }: Partial<{
    messages: ChatMessage[];
    maxMessages: number;
    maxMessageLength: number;
    minMessageLength: number;
  }> = {}) {
    this.#maxMessages = maxMessages;
    this.#messages = messages;
    this.#maxMessageLength = maxMessageLength;
    this.#minMessageLength = minMessageLength;
  }

  get cache() {
    return this.#messages.slice();
  }

  addMessage(message: ChatMessage | ChatReplyMessage, socket: WebSocket) {
    if (message instanceof ChatReplyMessage) {
      this.#ensureSenderCanReply(message);
    }
    if (this.#messages.length === this.#maxMessages) {
      this.#messages.shift();
    }
    this.#messages.push(message);
    ("socketStore");
    ("emit");
    ("everySocket");
    socket.emit("everySocket", new ChatMessageEvent(message));
  }

  ensureCorrectLength(text: string) {
    if (!text.length) {
      throw new Error("Нельзя прислать пустое сообщение");
    }
    if (text.length < this.#minMessageLength) {
      throw new Error(
        `Длинна сообщения менее минимальной длины, равной ${
          this.#minMessageLength
        }`,
      );
    }
    if (text.length > this.#maxMessageLength) {
      throw new Error(
        `Длинна сообщения превышает максимальную длину, равную ${
          this.#maxMessageLength
        }`,
      );
    }
  }

  #ensureSenderCanReply({ replyMessageId }: ChatReplyMessage) {
    if (
      this.#messages
        .slice()
        .reverse()
        .every((message) => replyMessageId !== message.id)
    ) {
      throw new Error(
        "Сообщение, на которое вы отправили ответ, не было найдено",
      );
    }
  }
}
