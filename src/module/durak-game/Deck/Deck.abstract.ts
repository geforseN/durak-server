import Card from "../entity/Card";
import { ranks, suits } from "../utility";

export type CardCount = 24 | 36 | 52;

export default abstract class Deck {
  protected _value: Card[];

  protected constructor(size?: CardCount) {
    this._value = size ? this.buildDeck(size) : [];
  }

  get count(): number {
    return this._value.length;
  }

  private buildDeck(size: CardCount): Card[] {
    const rankCount = Math.floor(size / suits.length);
    const avalableRanks = [...ranks].reverse().filter((rank, index) => index < rankCount);

    return suits.flatMap((suit) =>
      avalableRanks.map((rank) =>
        new Card({ rank, suit }),
      ),
    );
  }
}