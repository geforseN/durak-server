import type { Suit } from "@durak-game/durak-dts";

export default class CardSuit {
  constructor(readonly value: Suit) {}

  isEqualTo(suit: Suit | CardSuit) {
    return this.toString() === suit.toString();
  }

  toString() {
    return this.value;
  }
}
