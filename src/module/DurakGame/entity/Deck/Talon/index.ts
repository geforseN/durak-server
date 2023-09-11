import assert from "node:assert";
import Deck from "../Deck.abstract.js";
import { type default as Card, TrumpCard } from "../../Card/index.js";
import { type CanProvideCards } from "../../../DurakGame.js";
import type GameTalonWebsocketService from "./Talon.service.js";
import { buildTalon } from "./buildDeck.js";
import type { BasePlayer } from "../../Player/BasePlayer.abstract.js";
import type { CardCount } from "@durak-game/durak-dts";

export default class Talon extends Deck implements CanProvideCards<BasePlayer> {
  readonly #wsService: GameTalonWebsocketService;
  readonly trumpCard: Card;

  constructor(
    { cardCount }: { cardCount: CardCount },
    wsService: GameTalonWebsocketService,
  ) {
    super(buildTalon(cardCount));
    this.trumpCard = new TrumpCard(this.value[0]);
    this.#wsService = wsService;
  }

  get hasOneCard(): boolean {
    return this.count === 1;
  }

  provideCards(player: BasePlayer, count = player.missingNumberOfCards) {
    if (count === 0) return;
    const cards = this.#pop(count);
    this.#wsService.provideCardsAnimation(this, player, cards);
    player.receiveCards(...cards);
  }

  #pop(count: number): Card[] {
    if (count <= 0) {
      throw new Error("first argument must be positive number");
    }
    const startIndex = this.count - count;
    if (startIndex <= 0) {
      return this.#lastCards;
    }
    return this.value.splice(startIndex, count);
  }

  get #lastCards() {
    const lastCards = this.value.splice(0, this.count);
    assert.ok(this.isEmpty);
    return lastCards;
  }

  toJSON() {
    return {
      trumpCard: this.trumpCard.toJSON(),
      isEmpty: this.isEmpty,
      hasOneCard: this.hasOneCard,
    };
  }
}
