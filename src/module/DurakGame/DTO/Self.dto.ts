import { Player, PlayerKind } from "../entity/Player";
import { LobbyUser } from "../../../namespaces/lobbies/entity/lobby-users";
import CardDTO from "./Card.dto";

export default class SelfDTO {
  cards: CardDTO[];
  info: LobbyUser;
  role: PlayerKind;
  id: string;

  constructor(player: Player) {
    this.cards = player.hand.value.map((card) => new CardDTO(card));
    this.info = player.info;
    this.role = player.constructor.name as PlayerKind;
    this.id = player.id;
  }
}
