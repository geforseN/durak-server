import Card from "../Card/index.js";

export type CardCount = 24 | 36 | 52;

export default abstract class Deck {
  protected value: Card[];

  protected constructor(cards: Card[] = []) {
    this.value = cards;
  }

  *[Symbol.iterator]() {
    yield* this.value;
  }

  get count(): number {
    return this.value.length;
  }

  get isEmpty() {
    return this.value.length === 0;
  }
}
