import Deck, { CardCount } from "./Deck.abstract";
import Card from "../Card";
import { randomInt } from "crypto";
import { Suit } from "../../utility";

export default class Talon extends Deck {
  constructor(size: CardCount) {
    super(size);
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

  shuffle(): this {
    for (let i = 0; i < this.count; i++) {
      let k = randomInt(this.count);
      while (i === k) k = randomInt(this.count);
      this.swapCards(i, k);
    }
    return this;
  }

  /**
   * @param {number} cardCount Positive number
   * @todo add test
   * */
  popCards(cardCount = 1): Card[] {
    const index = this.count - cardCount;
    if (index < 0) return this.lastCards;
    return this._value.splice(index, cardCount);
  }

  private get lastCards() {
    return this._value.splice(0, this.count);
  }

  private swapCards(i: number, k: number) {
    [this._value[k], this._value[i]] = [this._value[i], this._value[k]];
  }
}