import assert from "node:assert";
import crypto from "node:crypto";
import Deck, { CardCount } from "../Deck.abstract";
import Card, { TrumpCard } from "../../Card";
import { type Player } from "../../Player";
import { type CanProvideCards } from "../../../DurakGame";
import type GameTalonWebsocketService from "./Talon.service";
import { buildTalon } from "./buildDeck";

export default class Talon extends Deck implements CanProvideCards<Player> {
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

  provideCards(player: Player, count = player.missingNumberOfCards) {
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
}
