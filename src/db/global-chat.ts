import { User } from "./user";

export namespace GlobalChatDB {
  export type GlobalChat = {
    messages: GlobalChatDB.Message[];
    users?: User[];
  };

  export type Message = {
    sender: User;
    receiver?: User;
    date: number;
    text: string;
  };
}
