import type { PlayerKind } from "@durak-game/durak-dts";
import { isPlayerKind } from "@durak-game/durak-dts";
import { Player } from "../entity/Player";
import CardDTO from "./Card.dto";
import assert from "node:assert";

export default class SelfDTO {
  cards: CardDTO[];
  info: Player["info"];
  kind: PlayerKind;
  id: string;

  constructor(player: Player) {
    this.cards = [...player.hand].map((card) => card.toJSON());
    this.info = player.info;
    assert.ok(isPlayerKind(player.constructor.name));
    this.kind = player.constructor.name;
    this.id = player.id;
  }
}
