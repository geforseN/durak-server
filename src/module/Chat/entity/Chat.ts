import type { SocketsStore } from "../../../ws/index.js";
import { ChatMessageEvent } from "../../../plugins/modules/chat/global-chat.auto-load.js";
import type ChatMessage from "./ChatMessage.js";
import type ChatReplyMessage from "./ChatReplyMessage.js";

export default class Chat {
  readonly #messages: ChatMessage[];
  readonly #maxMessages: number;
  readonly #maxMessageLength: number;
  readonly #minMessageLength: number;
  readonly #socketsStore: SocketsStore;

  constructor({
    messages = [],
    maxMessages = 100,
    maxMessageLength = 128,
    minMessageLength = 1,
    socketsStore,
  }: Partial<{
    messages: ChatMessage[];
    maxMessages: number;
    maxMessageLength: number;
    minMessageLength: number;
  }> & { socketsStore: SocketsStore }) {
    this.#maxMessages = maxMessages;
    this.#messages = messages;
    this.#maxMessageLength = maxMessageLength;
    this.#minMessageLength = minMessageLength;
    this.#socketsStore = socketsStore;
  }

  get cache() {
    return this.#messages.slice();
  }

  addMessage(message: ChatMessage | ChatReplyMessage) {
    if (message.isReplyMessage()) {
      this.#ensureSenderCanReply(message);
    }
    if (this.#messages.length === this.#maxMessages) {
      this.#messages.shift();
    }
    this.#messages.push(message);
    this.#socketsStore.emit(new ChatMessageEvent(message));
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
