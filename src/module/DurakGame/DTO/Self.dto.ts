import type { PlayerKind } from "@durak-game/durak-dts";
import { isPlayerKind } from "@durak-game/durak-dts";
import { Player } from "../entity/Player";
import CardDTO from "./Card.dto";

export default class SelfDTO {
  cards: CardDTO[];
  info: Player["info"];
  kind: PlayerKind;
  id: string;

  constructor(player: Player) {
    this.cards = [...player.hand].map((card) => new CardDTO(card));
    this.info = player.info;
    isPlayerKind(player.constructor.name);
    this.kind = player.constructor.name;
    this.id = player.id;
  }
}
