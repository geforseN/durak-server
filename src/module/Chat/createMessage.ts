import { randomUUID } from "node:crypto";
import { ChatMessage, ChatReplyMessage } from "./entity/index.js";
import type { ChatContext } from "../../plugins/modules/chat/global-chat.auto-load.js";

export default function createMessage({ sender, text, replyMessageId }: {
  sender: ChatContext['sender'],
  text: string,
  replyMessageId?: string | ReturnType<typeof randomUUID>
}) {
  return !replyMessageId
    ? new ChatMessage({ sender, text })
    : new ChatReplyMessage({ sender, text, replyMessageId });
}
