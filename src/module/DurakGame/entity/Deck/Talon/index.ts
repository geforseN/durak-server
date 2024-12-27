import { GameSettings } from "@durak-game/durak-dts";
import { Card as CardDTO } from "@durak-game/durak-dts";
import assert from "node:assert";

import type { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";

import { type CanProvideCards } from "@/module/DurakGame/DurakGame.js";
import { TrumpCard } from "@/module/DurakGame/entity/Card/TrumpCard.js";
import { type default as Card } from "@/module/DurakGame/entity/Card/index.js";
import Deck from "@/module/DurakGame/entity/Deck/Deck.abstract.js";
import buildTalon from "@/module/DurakGame/entity/Deck/Talon/buildTalon.js";

export default class Talon extends Deck implements CanProvideCards<BasePlayer> {
  readonly trumpCard: Card;

  constructor(
    settings: GameSettings["talon"],
  ) {
    super(buildTalon(settings));
    this.trumpCard = new TrumpCard(this.value[0]);
  }

  get #lastCards() {
    const lastCards = this.value.splice(0, this.count);
    assert.ok(this.isEmpty);
    return lastCards;
  }

  #pop(count: number): Card[] {
    assert.ok(
      Number.isInteger(count) && count > 0,
      "First argument must be positive number",
    );
    const startIndex = this.count - count;
    if (startIndex <= 0) {
      return this.#lastCards;
    }
    return this.value.splice(startIndex, count);
  }

  __test_only_getCard({ rank, suit }: CardDTO) {
    const card = this.value.find((card) => card.hasSame({ rank, suit }));
    assert.ok(card);
    return card;
  }

  provideCards(player: BasePlayer, count = player.missingNumberOfCards) {
    if (count === 0) return;
    const cards = this.#pop(count);
    player.receiveCards(...cards);
  }

  toJSON() {
    return {
      hasOneCard: this.hasOneCard,
      isEmpty: this.isEmpty,
      trumpCard: this.trumpCard.toJSON(),
    };
  }

  get hasOneCard(): boolean {
    return this.count === 1;
  }
}
