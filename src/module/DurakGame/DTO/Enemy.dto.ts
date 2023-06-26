import { LobbyUser } from "../../Lobbies/lobbies.namespace";
import { Player, PlayerKind } from "../entity/Player";

export default class EnemyDTO {
  cardCount: number;
  info: LobbyUser;
  role: PlayerKind;
  id: string;

  constructor(player: Player) {
    this.cardCount = player.hand.count;
    this.info = player.info;
    this.role = player.constructor.name as PlayerKind;
    this.id = player.id;
  }
}