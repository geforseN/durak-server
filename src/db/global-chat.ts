import { User } from "./shema";

export namespace GlobalChat {
  export type GlobalChat = {
    messages: GlobalChat.Message[];
    users?: User[];
  };

  export type Message = {
    sender: User;
    receiver?: User;
    date: number;
    text: string;
  };
}
