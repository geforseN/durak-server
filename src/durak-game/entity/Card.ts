import { Power, powerRecord, Rank, Suit } from "../utility.durak";
import DurakGame from "../durak-game";

export type CardConstructor = { suit: Suit, rank: Rank };

export default class Card {
  rank: Rank;
  suit: Suit;
  power: Power;

  constructor({ rank, suit }: CardConstructor) {
    this.rank = rank;
    this.suit = suit;
    this.power = powerRecord[rank];
  }

  isTrump({ game }: { game: DurakGame }): boolean {
    return game.talon.trumpCard.suit === this.suit;
  }
}