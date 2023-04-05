import Deck from "./Deck.abstract";
import Card, { CardObject } from "../Card";

export default class Hand extends Deck {
  constructor() {
    super();
  }

  get value() {
    return this._value;
  }

  has({ card: { suit, rank } }: CardObject): boolean {
    return this._value.some((card) => card.hasSame({ suit, rank }));
  }

  receive(...cards: Card[]): void {
    this._value.push(...cards);
  }

  findIndex({ card: { suit, rank } }: CardObject): number {
    return this._value.findIndex((card) => card.hasSame({ suit, rank }));
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }
}