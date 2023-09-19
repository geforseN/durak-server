import type { Card as CardDTO, Power, Rank, Suit } from "@durak-game/durak-dts";

import { powers, ranks, suits } from "@durak-game/durak-dts";

export type { Power, Rank, Suit };

export default class Card {
  static oneCharRank = ranks.map((v) => (v === "10" ? "0" : v));
  static powers = powers;
  static ranks = ranks;
  static suits = suits;

  readonly isTrump: boolean = false;

  readonly power: number;
  readonly rank: Rank;

  readonly suit: Suit;

  constructor({ rank, suit }: CardDTO) {
    this.rank = rank;
    this.suit = suit;
    this.power = Card.powers[rank];
  }

  static isDTO(cardLike: unknown): cardLike is CardDTO {
    return (
      typeof cardLike === "object" &&
      cardLike !== null &&
      "rank" in cardLike &&
      typeof cardLike.rank === "string" &&
      "suit" in cardLike &&
      typeof cardLike.suit === "string" &&
      ranks.some((rank): rank is Card["rank"] => rank === cardLike.rank) &&
      suits.some((suit): suit is Card["suit"] => suit === cardLike.suit)
    );
  }

  static isString(string: string): string is ReturnType<Card["asString"]> {
    return (
      Card.oneCharRank.includes(string[0] as Card["rankAsOneChar"]) &&
      Card.suits.includes(string[1] as Card["suit"])
    );
  }

  asString(): `${Card["rankAsOneChar"]}${Card["suit"]}` {
    return `${this.rankAsOneChar}${this.suit}`;
  }

  hasSame(cardProperties: Partial<CardDTO>): boolean {
    return Object.entries(cardProperties).every(([key, value]) => {
      return this[key as keyof this] === value;
    });
  }

  toJSON() {
    return { rank: this.rank, suit: this.suit };
  }

  get rankAsOneChar() {
    return this.rank === "10" ? "0" : this.rank;
  }
}
