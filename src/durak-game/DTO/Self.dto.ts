import Player from "../entity/Players/Player";
import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";
import Card from "../entity/Card";

export default class Self {
  cards: Card[];
  info: LobbyUser;

  constructor(cardPlayer: Player) {
    this.cards = cardPlayer.hand.value;
    this.info = cardPlayer.info;
  }
}