import assert from "node:assert";

import Card from "@/module/DurakGame/entity/Card/index.js";
import Deck from "@/module/DurakGame/entity/Deck/Deck.abstract.js";

export default class Hand extends Deck {
  constructor(cards?: Card[]);
  constructor(hand?: Hand);
  constructor(data?: Card[] | Hand) {
    super(data instanceof Hand ? data.value : data);
  }

  [Symbol.toPrimitive](hint: "default" | "number" | "string") {
    if (hint === "number") {
      return this.count;
    }
    if (hint === 'string') {
      return this.toString();
    }
  }

  get(
    cb: (card: Card, index: number) => boolean,
    notFoundMessage = "У вас нет такой карты",
  ) {
    const card = this.value.find(cb);
    assert.ok(card, notFoundMessage);
    return card;
  }

  getValidCard(cardLike: unknown) {
    if (cardLike instanceof Card) {
      assert.ok(this.value.includes(cardLike));
      return cardLike;
    }
    if (typeof cardLike === "string" && Card.isString(cardLike)) {
      return this.get((card) => card.asString() === cardLike);
    }
    assert.ok(Card.isDTO(cardLike));
    return this.get((card) =>
      card.hasSame({ rank: cardLike.rank, suit: cardLike.suit }),
    );
  }

  receive(cards: Card[]): void {
    this.value.push(...cards);
  }

  toDebugJSON() {
    return this.value.map((card, index) => {
      return {
        index,
        ...card.toJSON(),
        isTrump: card.isTrump,
      };
    });
  }

  toJSON() {
    return this.value.map((card) => card.toJSON());
  }

  toString() {
    return this.value.map((card, index) => `[${index}:${card}]`).join(" ");
  }
}
