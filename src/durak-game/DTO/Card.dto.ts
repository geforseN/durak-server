import { Rank, Suit } from "../utility";
import Card from "../entity/Card";

export default class CardDTO {
  rank: Rank;
  suit: Suit;

  constructor(card: Card) {
    this.suit = card.suit;
    this.rank = card.rank;
  }
}