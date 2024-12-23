import type { Suit } from "@durak-game/durak-dts";

export default class CardSuit {
  constructor(readonly value: Suit) {}

  isEqualTo(suit: Suit | CardSuit) {
    const value = suit instanceof CardSuit ? suit.value : suit;
    return this.value === value;
  }
}
