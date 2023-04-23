import Player from "../entity/Players/Player";
import { LobbyUser } from "../../namespaces/lobbies/entity/lobby-users";
import CardDTO from "./Card.dto";

export default class SelfDTO {
  cards: CardDTO[];
  info: LobbyUser;
  role: string;

  constructor(cardPlayer: Player) {
    this.cards = cardPlayer.hand.value.map((card) => new CardDTO(card));
    this.info = cardPlayer.info;
    this.role = cardPlayer.constructor.name;
  }
}
