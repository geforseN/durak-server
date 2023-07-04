export type Suit = (typeof Card.suits)[number];
export type Rank = (typeof Card.ranks)[number];
export type Power = number;
export type CardConstructor = { suit: Suit; rank: Rank; isTrump?: boolean };

export default class Card {
  readonly rank: Rank;
  readonly suit: Suit;
  readonly power: number;
  isTrump: boolean;

  constructor({ rank, suit, isTrump = false }: CardConstructor) {
    this.rank = rank;
    this.suit = suit;
    this.isTrump = isTrump;
    this.power = Card.powers[rank];
  }

  hasSame(cardProperties: Partial<CardConstructor>): boolean {
    return Object.entries(cardProperties).every(([key, value]) => {
      if (!Object.hasOwn(this, key)) {
        throw new Error("Нет такого поля");
      }
      return this[key as keyof this] === value;
    });
  }

  toString() {
    return this.suit + this.rank.at(-1) + " isTrump: " + this.isTrump;
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
  isTrump: boolean = true;
}

class DefendCard {
  canBeat(attackCard: AttackCard) {}
}

class AttackCard {}
