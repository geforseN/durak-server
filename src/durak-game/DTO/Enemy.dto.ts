import Player from "../entity/Players/Player";
import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";

export default class Enemy {
  cardCount: number;
  info: LobbyUser;

  constructor(cardPlayer: Player) {
    this.cardCount = cardPlayer.hand.count;
    this.info = cardPlayer.info;
  }
}