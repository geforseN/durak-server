import assert from "node:assert";
import crypto from "node:crypto";
import Card from "@/module/DurakGame/entity/Card/index.js";
import Hand from "@/module/DurakGame/entity/Deck/Hand/index.js";
import Deck from "@/module/DurakGame/entity/Deck/deck.js";

export default class SuperHand {
  #hand: Hand;

  constructor(readonly cards: Card[]) {
    this.#hand = new Hand(new Deck(cards));
  }

  get randomCard() {
    return this.cards[crypto.randomInt(this.cards.length)];
  }

  withRemoved(predicate: (card: Card) => boolean) {
    const index = this.cards.findIndex(predicate);
    assert.ok(index >= 0);
    return new Deck(this.cards.toSpliced(index, 1));
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
