import getUserForChat from "../../../prisma/user/getUserForChat";
import { randomUUID } from "crypto";
import { ChatMessage, ChatReplyMessage } from "./entity";

export default function createMessage({ sender, text, replyMessageId }: {
  sender: Awaited<ReturnType<typeof getUserForChat>>,
  text: string,
  replyMessageId?: string | ReturnType<typeof randomUUID>
}) {
  return !replyMessageId
    ? new ChatMessage({ sender, text })
    : new ChatReplyMessage({ sender, text, replyMessageId });
}
