import { Player } from "./entity/Player";
import { type GameSettings } from "../Lobbies/entity/CorrectGameSettings";
import type Lobby from "../Lobbies/entity/Lobby";
import { type DurakGameSocket } from "./socket/DurakGameSocket.types";

export class UnstartedGame {
  info: {
    id: string;
    adminId: string;
    durakPlayerId?: string;
    namespace?: DurakGameSocket.Namespace;
    isStarted: false;
  };
  settings: GameSettings;
  players: Player[];
  isStarted: boolean;

  constructor(lobby: Lobby) {
    this.info = {
      id: lobby.id,
      adminId: lobby.slots.admin.id,
      isStarted: false,
    };
    this.settings = lobby.settings;
    this.players = lobby.slots.value.map((slot) => new Player(slot));
    this.isStarted = false;
  }
}
