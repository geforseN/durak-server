import Deck, { CardCount } from "./Deck.abstract";
import Card from "../card";

export default class Hand extends Deck {
  constructor(size?: CardCount) {
    super(size);
  }

  get value() {
    return this._value;
  }

  get trumpCard(): Card {
    return this._value[0];
  }

  receiveCards(...cards: Card[]): void {
    this._value.push(...cards);
  }
}