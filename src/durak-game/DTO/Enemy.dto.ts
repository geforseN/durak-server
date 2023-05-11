import Player from "../entity/Players/Player";
import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";
import { PlayerRole } from "../../namespaces/games/games.types";

export default class EnemyDTO {
  cardCount: number;
  info: LobbyUser;
  role: PlayerRole;
  id: string;

  constructor(cardPlayer: Player) {
    this.cardCount = cardPlayer.hand.count;
    this.info = cardPlayer.info;
    this.role = cardPlayer.constructor.name as PlayerRole;
    this.id = cardPlayer.id;
  }
}