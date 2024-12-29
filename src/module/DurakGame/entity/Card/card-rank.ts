import type { Rank } from "@durak-game/durak-dts";

export default class CardRank {
  constructor(readonly value: Rank) {}

  isEqualTo(rank: Rank | CardRank) {
    return this.toString() === rank.toString();
  }

  toOneCharString() {
    return this.isEqualTo("10") ? "0" : this.value;
  }

  toString() {
    return this.value;
  }
}
