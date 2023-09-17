import { GameSettings } from "@durak-game/durak-dts";
import { Card as CardDTO } from "@durak-game/durak-dts";
import assert from "node:assert";

import type { BasePlayer } from "../../Player/BasePlayer.abstract.js";
import type GameTalonWebsocketService from "./Talon.service.js";

import { type CanProvideCards } from "../../../DurakGame.js";
import { TrumpCard } from "../../Card/TrumpCard.js";
import { type default as Card } from "../../Card/index.js";
import Deck from "../Deck.abstract.js";
import buildTalon from "./buildTalon.js";

export default class Talon extends Deck implements CanProvideCards<BasePlayer> {
  readonly #wsService: GameTalonWebsocketService;
  readonly trumpCard: Card;

  constructor(
    settings: GameSettings["talon"],
    wsService: GameTalonWebsocketService,
  ) {
    super(buildTalon(settings));
    this.trumpCard = new TrumpCard(this.value[0]);
    this.#wsService = wsService;
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
    this.#wsService.provideCardsAnimation(this, player, cards);
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
