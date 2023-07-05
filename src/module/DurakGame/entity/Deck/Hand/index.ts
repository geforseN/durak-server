import crypto from "node:crypto";
import assert from "node:assert";
import Deck from "../Deck.abstract";
import Card from "../../Card";

export default class Hand extends Deck {
  constructor() {
    super();
  }

  get(cb: (card: Card) => boolean, notFoundMessage = "У вас нет такой карты") {
    const card = this.value.find(cb);
    assert.ok(card, notFoundMessage);
    return card;
  }

  #getIndex(
    cb: (card: Card) => boolean,
    notFoundMessage = "Неверный индекс",
  ): number {
    const index = this.value.findIndex(cb);
    assert.ok(index > 0, notFoundMessage);
    return index;
  }

  receive(...cards: Card[]): void {
    this.value.push(...cards);
  }

  remove(
    cb: (card: Card) => boolean,
    notRemovedMessage = "Не получилось убрать свою карту",
  ) {
    const index = this.#getIndex(cb);
    const [removedCard] = this.value.splice(index, 1);
    assert.ok(removedCard, notRemovedMessage);
    return removedCard;
  }

  get randomCard() {
    return this.value[crypto.randomInt(0, this.count)];
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }
}

// TODO: work with class or delete class
class SuperHand extends Hand {
  override remove(cb: (card: Card) => boolean): Card {
    return super.remove(cb);
  }

  override get randomCard() {
    return super.randomCard;
  }
}
