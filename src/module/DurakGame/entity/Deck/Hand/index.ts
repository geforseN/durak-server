import assert from "node:assert";
import Deck from "../Deck.abstract";
import Card from "../../Card";

export default class Hand extends Deck {
  constructor(cards: Card[] = []) {
    super(cards);
  }

  get(cb: (card: Card) => boolean, notFoundMessage = "У вас нет такой карты") {
    const card = this.value.find(cb);
    assert.ok(card, notFoundMessage);
    return card;
  }

  receive(...cards: Card[]): void {
    this.value.push(...cards);
  }
}
