import { Power, powerRecord, Rank, Suit } from "../utility.durak";

export type CardConstructor = { suit: Suit, rank: Rank };
export type CardObject = { card: Card };

export default class Card {
  rank: Rank;
  suit: Suit;

  constructor({ rank, suit }: CardConstructor) {
    this.rank = rank;
    this.suit = suit;
    this.power = powerRecord[rank];
  }

  hasSame(obj: { suit: Suit } | { rank: Rank } | { power: Power }): boolean {
    const keys = Object.keys(obj);
    const key = keys[0] as "suit" | "rank" | "power";
    if (keys.length !== 1 || !obj.hasOwnProperty(key)) throw new Error();
    const value = Object.values(obj)[0] as Rank | Suit | number;

    return this[key] === value;
  }

  get power(): Power {
    return powerRecord[this.rank];
  }

  toString(): string {
    return `${this.suit}_${this.rank.padStart(2)}`;
  }
}