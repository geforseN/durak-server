import { GlobalChatDB } from "./global-chat";
import { User } from "./user";

import findByAccNameOrThrow from "./methods/findByAccNameOrThrow";
import getAll from "./methods/getAll";

export type DB = {
  User: {
    getAll: () => User[],
    findByAccNameOrThrow: (accName: string) => User | never
  };
  GlobalChat: GlobalChatDB.GlobalChat;
};

const DB: DB = {
  User: {
    getAll,
    findByAccNameOrThrow,
  },
  GlobalChat: {
    messages: [],
  },
};

export default DB;
