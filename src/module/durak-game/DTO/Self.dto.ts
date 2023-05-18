import Player from "../Players/Player";
import { LobbyUser } from "../../../namespaces/lobbies/entity/lobby-users";
import CardDTO from "./Card.dto";
import { PlayerRole } from "../../../namespaces/games/games.types";

export default class SelfDTO {
  cards: CardDTO[];
  info: LobbyUser;
  role: PlayerRole;
  id: string;

  constructor(cardPlayer: Player) {
    this.cards = cardPlayer.hand.value.map((card) => new CardDTO(card));
    this.info = cardPlayer.info;
    this.role = cardPlayer.constructor.name as PlayerRole;
    this.id = cardPlayer.id;
  }
}
