import Deck, { CardCount } from "./Deck.abstract";
import Card from "../Card";
import { randomInt } from "crypto";
import { Suit } from "../../utility.durak";

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

  shuffle(): this {
    for (let i = 0; i < this.count; i++) {
      let j = randomInt(this.count);
      while (i === j) j = randomInt(this.count);
      [this._value[j], this._value[i]] = [this._value[i], this._value[j]]
    }
    return this;
  }

  ensureCanDraw(cardCount: number): this | never {
    if (cardCount <= 0 || !Number.isInteger(cardCount)) {
      throw Error("This method received as an argument not positive integer.")
    }
    // else if (cardCount > this.cardCount) {}
    return this;
  }

  popCards(cardCount = 1): Card[] {
    const index = this.count - 1 - cardCount;
    return this._value.splice(index, cardCount);
  }
}