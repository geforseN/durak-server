import { randomUUID } from "crypto";
import { ChatContext } from "../chatPlugin";

export default class ChatMessage {
  sender: ChatContext["sender"];
  date: number;
  text: string;
  id: ReturnType<typeof randomUUID>;

  constructor(props: { sender: ChatContext["sender"]; text: string }) {
    this.date = new Date().getTime();
    this.sender = props.sender;
    this.text = props.text;
    this.id = randomUUID();
  }
}
