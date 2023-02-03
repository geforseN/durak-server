import CardPlayer, { CardPlayerRole, CardPlayerStatus } from "../entity/card-player";
import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";
import Hand from "../entity/Deck/Hand";

export default class Self {
  hand: Hand;
  info: LobbyUser;
  role: CardPlayerRole;
  status: CardPlayerStatus;

  constructor(cardPlayer: CardPlayer) {
    this.hand = cardPlayer.hand;
    this.info = cardPlayer.info;
    this.role = cardPlayer.role;
    this.status = cardPlayer.status;
  }
}