import type { Rank } from "@durak-game/durak-dts";

export default class CardRank {
  constructor(readonly value: Rank) {}

  isEqualTo(rank: Rank | CardRank) {
    const value = rank instanceof CardRank ? rank.value : rank;
    return this.value === value;
  }

  get asOneChar() {
    return this.isEqualTo("10") ? "0" : this.value;
  }
}
