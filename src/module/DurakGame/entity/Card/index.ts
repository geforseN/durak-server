import { Card as CardDTO } from "@durak-game/durak-dts";

export type Suit = (typeof Card.suits)[number];
export type Rank = (typeof Card.ranks)[number];
export type Power = (typeof Card.powers)[keyof typeof Card.powers];

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
      if (!Object.hasOwn(this, key)) {
        throw new Error("Нет такого поля");
      }
      return this[key as keyof this] === value;
    });
  }

  toString() {
    return `${this.suit}${this.rank.at(-1)}${this.isTrump ? "+" : "-"}`;
  }

  toJSON() {
    return { rank: this.rank, suit: this.suit };
  }

  static suits = ["♠", "♦", "♥", "♣"] as const;
  static ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ] as const;
  static powers: Record<Rank, number> = {
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4,
    "6": 5,
    "7": 6,
    "8": 7,
    "9": 8,
    "10": 9,
    J: 10,
    Q: 11,
    K: 12,
    A: 13,
  } as const;
}

export class TrumpCard extends Card {
  readonly isTrump: boolean = true;
}

// TODO: add methods to class or delete class
class DefendCard {
  canBeat(attackCard: AttackCard) {}
}

// TODO: add methods to class or delete class
class AttackCard {}
