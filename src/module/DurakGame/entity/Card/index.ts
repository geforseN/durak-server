import type { CardDTO, Power, Rank, Suit } from "@durak-game/durak-dts";
import { ranks, suits } from "@durak-game/durak-dts";
import CardRank from "@/module/DurakGame/entity/Card/card-rank.js";
import CardSuit from "@/module/DurakGame/entity/Card/card-suit.js";

export type { Power, Rank, Suit };

export default class Card {
  static ranks = ranks;
  static suits = suits;

  constructor(
    readonly rank: CardRank,
    readonly suit: CardSuit,
  ) {}

  static create(rank: Rank, suit: Suit) {
    return new Card(new CardRank(rank), new CardSuit(suit));
  }

  isEqualTo(card: Card | CardDTO) {
    const dto = card instanceof Card ? card.toJSON() : card;
    return this.rank.isEqualTo(dto.rank) && this.suit.isEqualTo(dto.suit);
  }

  toTwoCharString(): `${ReturnType<CardRank["toOneCharString"]>}${ReturnType<CardSuit["toString"]>}` {
    return `${this.rank.toOneCharString()}${this.suit.toString()}`;
  }

  toJSON() {
    return {
      rank: this.rank.value,
      suit: this.suit.value,
    };
  }
}
