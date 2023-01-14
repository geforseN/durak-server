import { GlobalChat } from "./global-chat";
import { User } from "./shema";
import { Socket } from "socket.io";

import findOrThrow from "./methods/findOrThrow";
import getAll from "./methods/getAll";

export type DB = {
  User: {
    getAll: () => User[],
    findOrThrow: (socket: Socket & { accName?: string }) => User | never
  };
  GlobalChat: GlobalChat.GlobalChat;
};

const DB: DB = {
  User: {
    getAll,
    findOrThrow,
  },
  GlobalChat: {
    messages: [],
  },
};

export default DB;
