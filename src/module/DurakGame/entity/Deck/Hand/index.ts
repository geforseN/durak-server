import assert from "node:assert";

import Card from "@/module/DurakGame/entity/Card/index.js";
import Deck from "@/module/DurakGame/entity/Deck/deck.js";

export default class Hand {
  constructor(readonly deck: Deck) {}

  static create(payload?: Card[] | Hand) {
    const deck =
      payload instanceof Hand ? payload.deck : new Deck(payload || []);
    return new Hand(deck);
  }

  [Symbol.toPrimitive](hint: "default" | "number" | "string") {
    if (hint === "number") {
      return this.deck.count;
    }
    if (hint === "string") {
      return this.toString();
    }
  }

  get(
    cb: (card: Card, index: number) => boolean,
    notFoundMessage = "У вас нет такой карты",
  ) {
    const card = this.deck.cards.find(cb);
    assert.ok(card, notFoundMessage);
    return card;
  }

  withAdded(cards: Card[]) {
    return new Hand(new Deck([...this.deck.cards, ...cards]));
  }

  toDebugJSON() {
    return this.deck.cards.map((card, index) => {
      return {
        index,
        ...card.toJSON(),
        isTrump: card.isTrump,
      };
    });
  }

  toJSON() {
    return this.deck.cards.map((card) => card.toJSON());
  }

  toString() {
    return this.deck.cards.map((card, index) => `[${index}:${card}]`).join(" ");
  }
}
