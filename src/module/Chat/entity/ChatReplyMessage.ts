import { randomUUID } from "crypto";
import ChatMessage from "./ChatMessage";
import { ChatContext } from "../chatPlugin";

export default class ChatReplyMessage extends ChatMessage {
  replyMessageId: string | ReturnType<typeof randomUUID>;

  constructor(props: {
    sender: ChatContext["sender"];
    text: string;
    replyMessageId: string | ReturnType<typeof randomUUID>;
  }) {
    super(props);
    this.replyMessageId = props.replyMessageId;
  }
}
