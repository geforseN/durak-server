import { type ChatContext } from "../../../plugins/modules/chat/global-chat.auto-load.js";
import ChatMessage from "./ChatMessage.js";

export default class ChatReplyMessage extends ChatMessage {
  replyMessageId: string;

  constructor(props: {
    sender: ChatContext["sender"];
    text: string;
    replyMessageId: string;
  }) {
    super(props);
    this.replyMessageId = props.replyMessageId;
  }

  override isReplyMessage(): this is ChatReplyMessage {
    return true;
  }
}
