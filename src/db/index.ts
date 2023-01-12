import { GlobalChat } from "./GlobalChat";
import { User } from "./shema";
import users from "./users";


export type DB = {
  User: User[];
  GlobalChat: GlobalChat;
};

const DB: DB = {
  User: users,
  GlobalChat: {
    messages: [],
  },
};

export default DB;
