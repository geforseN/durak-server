import Deck from "./Deck.abstract";
import Card from "../card";

export default class Discard extends Deck {
  constructor() {
    super();
  }

  push(...cards: Card[]): number {
    return this._value.push(...cards);
  }
}