import CardPlayer, { CardPlayerRole, CardPlayerStatus } from "../entity/card-player";
import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";
import Card from "../entity/card";

export default class Self {
  cards: Card[];
  info: LobbyUser;
  role: CardPlayerRole;
  status: CardPlayerStatus;

  constructor(cardPlayer: CardPlayer) {
    this.cards = cardPlayer.hand.value;
    this.info = cardPlayer.info;
    this.role = cardPlayer.role;
    this.status = cardPlayer.status;
  }
}