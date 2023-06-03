import { randomUUID } from "crypto";
import getUserForChat from "../../../../prisma/user/getUserForChat";

export default class ChatMessage {
  sender: Awaited<ReturnType<typeof getUserForChat>>;
  date: number;
  text: string;
  id: ReturnType<typeof randomUUID>;

  constructor(props: { sender: Awaited<ReturnType<typeof getUserForChat>>, text: string }) {
    this.date = new Date().getTime();
    this.sender = props.sender;
    this.text = props.text;
    this.id = randomUUID();
  }

  static ensureCorrectTextLength(text: string) {
    if (!text.length) {
      throw new Error("Нельзя прислать пустое сообщение");
    }
    if (text.length > 128) {
      throw new Error("Длинна сообщения превышает 128");
    }
  }
}