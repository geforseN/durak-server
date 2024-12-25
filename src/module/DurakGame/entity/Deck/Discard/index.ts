import Deck from "@/module/DurakGame/entity/Deck/deck.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";

export default class Discard {
  #deck;

  constructor(readonly cards: Card[]) {
    this.#deck = new Deck(cards);
  }

  withAdded(...cards: Card[]) {
    return new Discard([...this.cards, ...cards]);
  }

  toJSON() {
    return {
      isEmpty: this.#deck.isEmpty,
    };
  }
}
