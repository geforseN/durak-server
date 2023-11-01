import { randomInt } from "node:crypto";
import Deck, { CardCount } from "../Deck.abstract";
import Card, { Suit } from "../../Card";
import { Player, Players, AllowedMissingCardCount } from "../../Player";
import { CanProvideCards } from "../../../DurakGame.implimetntation";
import GameTalonService from "./Talon.service";

export default class Talon extends Deck implements CanProvideCards<Player> {
  private service?: GameTalonService;
  trumpCard: Card;

  constructor(size: CardCount) {
    super(size);
    this.shuffle().shuffle().shuffle().shuffle().shuffle();
    this.trumpCard = new Card(this._value[0]);
    this.injectIsCardTrump();
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

  provideCards(player: Player, count = player.missingNumberOfCards) {
    if (count === 0) return;
    const cards = this.pop({ count });
    player.receiveCards(...cards);
    this.service?.provideCardsAnimation({ player, cards, talon: this });
  }

  private injectIsCardTrump() {
    this._value.forEach((card) => {
      card.isTrump = card.suit === this.trumpSuit;
    });
  }

  injectService(talonService: GameTalonService) {
    this.service = talonService;
  }
}