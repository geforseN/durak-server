import { GlobalChatDB } from "../namespaces/global-chat/global-chat.namespace";
import { LobbyUser } from "../namespaces/lobbies/entity/lobby-users";

export default function createMessage(user: LobbyUser, text: string): GlobalChatDB.Message {
  return {
    sender: user,
    date: new Date().getTime(),
    text,
  };
}