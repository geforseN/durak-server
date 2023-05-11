import { randomInt } from "node:crypto";
import Deck, { CardCount } from "./Deck.abstract";
import Card from "../Card";
import { Suit } from "../../utility";
import { Player } from "../Players";
import GameTalonService from "../Services/Talon.service";
import { CanProvideCards } from "../../DurakGame";

export default class Talon extends Deck implements CanProvideCards<Player> {
  private service?: GameTalonService;

  constructor(size: CardCount) {
    super(size);
    this.injectCardIsTrump();
    this.shuffle().shuffle();
  }

  get trumpCard(): Card {
    return this._value[0];
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

  /** @param {number} cardCount Positive number */
  pop({ count = 1 }: { count?: number } = {}): Card[] {
    const startIndex = this.count - count;
    if (startIndex <= 0) return this.lastCards;
    return this._value.splice(startIndex, count);
  }

  private shuffle(): this {
    for (let currentIndex = 0; currentIndex < this.count; currentIndex++) {
      this.swapCards(currentIndex, randomInt(this.count));
    }
    return this;
  }

  private get lastCards() {
    return this._value.splice(0, this.count);
  }

  private swapCards(i: number, k: number) {
    [this._value[k], this._value[i]] = [this._value[i], this._value[k]];
  }

  private injectCardIsTrump() {
    for (let i = this._value.length - 1; i > 0; i--) {
      const card = this._value[i];
      card.isTrump = card.suit === this.trumpSuit;
    }
  }

  provideCards<Target extends Player>(player: Target, cardCount = player.missingNumberOfCards) {
    if (cardCount === 0) return;
    const cards = this.pop(cardCount);
    player.receiveCards(...cards);
    this.service?.provideCards({ player, cards });
    if (this.isEmpty) {
      this.service?.moveTrumpCard({ player });
    }
  }

  injectService(talonService: GameTalonService) {
    this.service = talonService;
  }
}