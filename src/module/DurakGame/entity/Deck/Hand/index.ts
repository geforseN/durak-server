import Deck from "../Deck.abstract";
import Card from "../../Card";

export default class Hand extends Deck {
  constructor() {
    super();
  }

  get value() {
    return this._value;
  }

  has({ card: { suit, rank } }: { card: ConstructorParameters<typeof Card>[0] }): boolean {
    return this._value.some((card) => card.hasSame({ suit, rank }));
  }

  receive(...cards: Card[]): void {
    this._value.push(...cards);
  }

  findIndex({ card: { suit, rank } }: { card: Card }): number {
    return this._value.findIndex((card) => card.hasSame({ suit, rank }));
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }
}