import { User } from "./shema";

export type GlobalChat = {
  messages: GlobalChat.Message[];
  users?: User[];
};

export namespace GlobalChat {
  export type Message = {
    sender: User;
    receiver?: User;
    date: string | Date; // new Date() on server, Intl on client
    text: string;
  };
}
