import Card from "../Card";

export type CardCount = 24 | 36 | 52;

export default abstract class Deck {
  protected value: Card[];

  protected constructor(size?: CardCount) {
    this.value = this.#buildDeck(size);
  }

  *[Symbol.iterator]() {
    yield* this.value;
  }

  get count(): number {
    return this.value.length;
  }

  #avalableRanks(rankCount: number) {
    return [...Card.ranks]
      .reverse()
      .filter((_rank, index) => index < rankCount);
  }

  #buildDeck(size?: CardCount): Card[] {
    if (!size) return [];
    const rankCount = Math.floor(size / Card.suits.length);
    const avalableRanks = this.#avalableRanks(rankCount);
    return Card.suits.flatMap((suit) =>
      avalableRanks.map((rank) => new Card({ rank, suit })),
    );
  }
}
