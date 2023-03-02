import { Power, powerRecord, Rank, Suit } from "../utility";

export type CardConstructor = { suit: Suit, rank: Rank };
export type CardObject = { card: Card };

export default class Card {
  rank: Rank;
  suit: Suit;

  constructor({ rank, suit }: CardConstructor) {
    this.rank = rank;
    this.suit = suit;
  }

  get power(): Power {
    return powerRecord[this.rank];
  }


  hasSame(cardEntries: { suit?: Suit, rank?: Rank, power?: Power }): boolean {
    for (const [key, value] of Object.entries(cardEntries)) {
      if (!Object.hasOwn(this, key)) throw new Error("Нет такого поля");
      if (this[key as keyof this] !== value) return false;
    }
    return true;
  }

  weakerThan(card: Card) {
    return this.power < card.power;
  }

  toString(): string {
    return `${this.suit}_${this.rank.padStart(2)}`;
  }
}