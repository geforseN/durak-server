import { Player, PlayerKind } from "../entity/Player";
import CardDTO from "./Card.dto";

export default class SelfDTO {
  cards: CardDTO[];
  info: Player['info'];
  kind: PlayerKind;
  id: string;

  constructor(player: Player) {
    this.cards = [...player.hand].map((card) => new CardDTO(card));
    this.info = player.info;
    this.kind = player.constructor.name as PlayerKind;
    this.id = player.id;
  }
}
