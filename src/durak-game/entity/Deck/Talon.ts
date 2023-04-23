import { randomInt } from "node:crypto";
import Deck, { CardCount } from "./Deck.abstract";
import Card from "../Card";
import { Suit } from "../../utility";

export default class Talon extends Deck {
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

  get isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * @param {number} cardCount Positive number
   * */
  popCards(cardCount = 1): Card[] {
    const index = this.count - cardCount;
    if (index <= 0) return this.lastCards;
    return this._value.splice(index, cardCount);
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
}