import Card from "@/module/DurakGame/entity/Card/index.js";

// receivable-deck

export default class Deck {
  constructor(readonly cards: Card[]) {}

  static get empty() {
    return new Deck([]);
  }

  get count() {
    return this.cards.length;
  }

  get isEmpty() {
    return this.cards.length === 0;
  }
}
