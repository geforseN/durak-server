import crypto from "node:crypto";
import type { ChatContext } from "@/plugins/modules/chat/global-chat.auto-load.js";
import type ChatReplyMessage from "@/module/Chat/entity/ChatReplyMessage.js";

export default class ChatMessage {
  sender: ChatContext["sender"];
  date: number;
  text: string;
  id: string;

  constructor(props: { sender: ChatContext["sender"]; text: string }) {
    this.date = new Date().getTime();
    this.sender = props.sender;
    this.text = props.text;
    this.id = crypto.randomUUID();
  }

  isReplyMessage(): this is ChatReplyMessage {
    return false;
  }
}
