import assert from "node:assert";

import type { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import TrumpCard from "@/module/DurakGame/entity/Card/trump-card.js";
import Deck from "@/module/DurakGame/entity/Deck/deck.js";

export default class Talon {
  deck: Deck;
  trumpCard: TrumpCard;

  constructor(readonly cards: Card[]) {
    this.deck = new Deck(cards);
    this.trumpCard = TrumpCard.from(cards[0]);
  }

  provideCards(player: BasePlayer, count: number) {
    assert.ok(
      Number.isInteger(count) && count >= 0,
      "First argument must be positive number",
    );
    if (count === 0) {
      return;
    }
    let cards: Card[];
    const startIndex = this.deck.count - count;
    if (startIndex <= 0) {
      const lastCards = this.cards.splice(0, this.deck.count);
      assert.ok(this.deck.isEmpty);
      cards = lastCards;
    } else {
      cards = this.cards.splice(startIndex, count);
    }
    player.cards.receive(...cards);
  }

  toJSON() {
    return {
      hasOneCard: this.deck.count === 1,
      isEmpty: this.deck.isEmpty,
      trumpCard: this.trumpCard.toJSON(),
    };
  }
}
