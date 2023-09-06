import Card from "../../Card";
import Hand from ".";
import assert from "node:assert";
import crypto from "node:crypto";

export default class SuperHand extends Hand {
  constructor(hand: Hand) {
    super(hand);
  }

  get randomCard() {
    return this.value[crypto.randomInt(this.count)];
  }

  remove(
    cb: (card: Card) => boolean,
    notRemovedMessage = "Не получилось убрать свою карту",
  ): Card {
    const index = this.value.findIndex(cb);
    assert.ok(index >= 0, notRemovedMessage);
    const [removedCard] = this.value.splice(index, 1);
    assert.ok(removedCard, notRemovedMessage);
    return removedCard;
  }
}
