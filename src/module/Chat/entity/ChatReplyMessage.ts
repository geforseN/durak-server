import { randomUUID } from "crypto";
import ChatMessage from "./ChatMessage";
import getUserForChat from "../../../../prisma/user/getUserForChat";

export default class ChatReplyMessage extends ChatMessage {
  replyMessageId: string | ReturnType<typeof randomUUID>;

  constructor(props: {
    sender: Awaited<ReturnType<typeof getUserForChat>>,
    text: string,
    replyMessageId: string | ReturnType<typeof randomUUID>
  }) {
    super(props);
    this.replyMessageId = props.replyMessageId;
  }
}