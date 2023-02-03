import CardPlayer, { CardPlayerRole, CardPlayerStatus } from "../entity/card-player";
import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";

export default class Enemy {
  cardCount: number;
  info: LobbyUser;
  role: CardPlayerRole;
  status: CardPlayerStatus;

  constructor(cardPlayer: CardPlayer) {
    this.cardCount = cardPlayer.hand.count;
    this.info = cardPlayer.info;
    this.role = cardPlayer.role;
    this.status = cardPlayer.status;
  }

}