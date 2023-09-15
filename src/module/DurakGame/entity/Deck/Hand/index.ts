import assert from "node:assert";
import Deck from "../Deck.abstract.js";
import Card from "../../Card/index.js";

export default class Hand extends Deck {
  constructor(cards?: Card[]);
  constructor(hand?: Hand);
  constructor(data?: Card[] | Hand) {
    super(data instanceof Hand ? data.value : data);
  }

  get(cb: (card: Card) => boolean, notFoundMessage = "У вас нет такой карты") {
    const card = this.value.find(cb);
    assert.ok(card, notFoundMessage);
    return card;
  }

  receive(cards: Card[]): void {
    this.value.push(...cards);
  }

  toString() {
    return this.value.map((card, index) => `[${index}_${card}]`).join(" ");
  }

  toJSON() {
    return this.value.map((card, index) => {
      return {
        index,
        ...card.toJSON(),
        isTrump: card.isTrump,
      };
    });
  }
}
