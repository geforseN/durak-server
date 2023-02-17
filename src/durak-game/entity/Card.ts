import { Power, powerRecord, Rank, Suit } from "../utility.durak";

export type CardConstructor = { suit: Suit, rank: Rank };
export type CardObject = { card: Card };

export default class Card {
  rank: Rank;
  suit: Suit;
  power: Power;

  constructor({ rank, suit }: CardConstructor) {
    this.rank = rank;
    this.suit = suit;
    this.power = powerRecord[rank];
  }
}