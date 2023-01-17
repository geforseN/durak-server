import { User } from "../db/user";
import { GlobalChatDB } from "../db/global-chat";

export default function createMessage(user: User, text: string): GlobalChatDB.Message {
  return {
    sender: user,
    date: new Date().getTime(),
    text,
  };
}