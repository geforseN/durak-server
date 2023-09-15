import { suits, ranks, powers } from "@durak-game/durak-dts";
import type { Card as CardDTO, Suit, Rank, Power } from "@durak-game/durak-dts";

export type { Suit, Rank, Power };

export default class Card {
  readonly rank: Rank;
  readonly suit: Suit;
  readonly power: number;
  readonly isTrump: boolean = false;

  constructor({ rank, suit }: CardDTO) {
    this.rank = rank;
    this.suit = suit;
    this.power = Card.powers[rank];
  }

  hasSame(cardProperties: Partial<CardDTO>): boolean {
    return Object.entries(cardProperties).every(([key, value]) => {
      return this[key as keyof this] === value;
    });
  }

  toString() {
    return `${this.suit}${this.rank.at(-1)}${this.isTrump ? "+" : "-"}`;
  }

  toJSON() {
    return { rank: this.rank, suit: this.suit };
  }

  static suits = suits;
  static ranks = ranks;
  static powers = powers;
}
