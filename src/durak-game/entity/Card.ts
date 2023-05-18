import { Power, powerRecord, Rank, Suit } from "../utility";

export type CardConstructor = { suit: Suit, rank: Rank, isTrump?: boolean };

export default class Card {
  rank: Rank;
  suit: Suit;
  isTrump: boolean;

  constructor({ rank, suit, isTrump = false }: CardConstructor) {
    this.rank = rank;
    this.suit = suit;
    this.isTrump = isTrump;
  }

  get power(): Power {
    return powerRecord[this.rank];
  }

  hasSame(cardProperties: Partial<CardConstructor>): boolean {
    return Object.entries(cardProperties).every(([key, value]) => {
      if (!Object.hasOwn(this, key)) {
        throw new Error("Нет такого поля");
      }
      return this[key as keyof this] === value;
    });
  }
}
