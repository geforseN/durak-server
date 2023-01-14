import { User } from "../db/shema";
import { GlobalChat } from "../db/global-chat";

export default function createMessage(user: User, text: string): GlobalChat.Message {
  return {
    sender: user,
    date: new Date().getTime(),
    text,
  };
}