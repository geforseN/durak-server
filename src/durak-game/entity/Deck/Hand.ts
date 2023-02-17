import Deck, { CardCount } from "./Deck.abstract";
import Card, { CardObject } from "../Card";

export default class Hand extends Deck {
  constructor(size?: CardCount) {
    super(size);
  }

  get value() {
    return this._value;
  }

  has({ card: { suit, rank } }: CardObject): boolean {
    return this._value.some((card) => card.suit === suit && card.rank === rank);
  }

  receive(...cards: Card[]): void {
    this._value.push(...cards);
  }

  findIndex({ card: { suit, rank } }: CardObject): number {
    return this._value.findIndex((card) => card.suit === suit && card.rank === rank);
  }
}