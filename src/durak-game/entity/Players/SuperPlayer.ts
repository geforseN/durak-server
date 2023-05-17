import assert from "node:assert";
import Player from "./Player";
import Card from "../Card";
import { randomInt } from "node:crypto";

export default abstract class SuperPlayer extends Player {
  public remove({ card }: { card: Card }): Card {
    const index = this.hand.findIndex({ card });
    assert.notStrictEqual(index, -1, "Неверный индекс");
    const [removedCard] = this.hand.value.splice(index, 1);
    assert.ok(removedCard, "Не получилось убрать свою карту");
    this.service?.removeCard({ player: this, card: removedCard });
    return removedCard;
  }

  get randomCard() {
    return this.hand.value[this.#randomCardIndex]
  }

  get #randomCardIndex() {
    return randomInt(0, this.hand.count);
  }
};