export default class Deck<T> {
  constructor(readonly cards: T[]) {}

  static get empty() {
    return new Deck([]);
  }

  get count() {
    return this.cards.length;
  }

  get isEmpty() {
    return this.cards.length === 0;
  }
}
