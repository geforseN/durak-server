import { LobbyUser } from "../lobbies/entity/lobby-users";

export namespace GlobalChatDB {
  export type Message = {
    sender: LobbyUser;
    receiver?: LobbyUser;
    date: number;
    text: string;
  };
}
