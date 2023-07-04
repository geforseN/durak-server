import { GameSettings } from "../Lobbies/entity/CorrectGameSettings";
import Lobby from "../Lobbies/entity/Lobby";
import { Players } from "./entity";
import { DurakGameSocket } from "./socket/DurakGameSocket.types";

export class UnstartedGame {
  info: {
    id: string;
    adminId: string;
    durakPlayerId?: string;
    namespace?: DurakGameSocket.Namespace;
    isStarted: false;
  };
  settings: GameSettings;
  players: Players;
  constructor(lobby: Lobby) {
    this.info = {
      id: lobby.id,
      adminId: lobby.slots.admin.id,
      isStarted: false,
    };
    this.settings = lobby.settings;
    this.players = new Players(lobby.slots.users);
  }
}
