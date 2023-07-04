import { randomInt } from "node:crypto";
import Deck, { CardCount } from "../Deck.abstract";
import Card, { Suit } from "../../Card";
import { Player } from "../../Player";
import { CanProvideCards } from "../../../DurakGame.implimetntation";
import GameTalonWebsocketService from "./Talon.service";
import assert from "node:assert";

export default class Talon extends Deck implements CanProvideCards<Player> {
  readonly #wsService: GameTalonWebsocketService;
  readonly trumpCard: Card;

  constructor(
    settings: { cardCount: CardCount },
    wsService: GameTalonWebsocketService,
  ) {
    super(settings.cardCount);
    this.#shuffle().#shuffle().#shuffle().#shuffle().#shuffle();
    this.trumpCard = new Card({ ...this.value[0], isTrump: true });
    this.value.forEach((card) => {
      card.isTrump = card.suit === this.trumpCard.suit;
    });
    this.#wsService = wsService;
  }

  get trumpSuit(): Suit {
    return this.trumpCard.suit;
  }

  get hasCards(): boolean {
    return !this.isEmpty;
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  get hasOneCard(): boolean {
    return this.count === 1;
  }

  /** @param {number} cardCount Positive number */
  #pop(count: number = 1): Card[] {
    const startIndex = this.count - count;
    if (startIndex <= 0) {
      return this.#lastCards;
    }
    return this.value.splice(startIndex, count);
  }

  // TODO refactor alghoritm
  #shuffle(): this {
    for (let currentIndex = 0; currentIndex < this.count; currentIndex++) {
      this.#swapCards(currentIndex, randomInt(this.count));
    }
    return this;
  }

  get #lastCards() {
    const lastCards = this.value.splice(0, this.count);
    assert.ok(!this.hasCards);
    return lastCards;
  }

  #swapCards(i: number, k: number) {
    [this.value[k], this.value[i]] = [this.value[i], this.value[k]];
  }

  provideCards(player: Player, count = player.missingNumberOfCards) {
    if (count === 0) return;
    const cards = this.#pop(count);
    player.receiveCards(...cards);
    this.#wsService.provideCardsAnimation({ player, cards, talon: this });
  }
}
