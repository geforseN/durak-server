import Player, { CardPlayerStatus } from "../entity/Players/Player";
import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";

export default class Enemy {
  cardCount: number;
  info: LobbyUser;
  status: CardPlayerStatus;

  constructor(cardPlayer: Player) {
    this.cardCount = cardPlayer.hand.count;
    this.info = cardPlayer.info;
    this.status = cardPlayer.status;
  }

}