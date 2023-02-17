import Deck from "./Deck.abstract";
import Card from "../Card";

export default class Discard extends Deck {
  constructor() {
    super();
  }

  push(...cards: Card[]): void {
    this._value.push(...cards);
  }
}