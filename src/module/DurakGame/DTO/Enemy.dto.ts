import type { PlayerKind } from "@durak-game/durak-dts";
import { isPlayerKind } from "@durak-game/durak-dts";
import LobbyUser from "../../Lobbies/entity/LobbyUser";
import { Player } from "../entity/Player";

export default class EnemyDTO {
  cardCount: number;
  info: LobbyUser;
  kind: PlayerKind;
  id: string;

  constructor(player: Player) {
    this.cardCount = player.hand.count;
    this.info = player.info;
    isPlayerKind(player.constructor.name);
    this.kind = player.constructor.name;
    this.id = player.id;
  }
}
