import Deck, { CardCount } from "./Deck.abstract";
import Card from "../Card";

export default class Hand extends Deck {
  constructor(size?: CardCount) {
    super(size);
  }

  get value() {
    return this._value;
  }

  has({ card: { suit, rank } }: { card: Card }) {
    return this._value.some((card) => card.suit === suit && card.rank === rank);
  }

  receiveCards(...cards: Card[]): void {
    this._value.push(...cards);
  }
}