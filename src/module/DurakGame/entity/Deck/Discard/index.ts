import Deck from "@/module/DurakGame/entity/Deck/Deck.abstract.js";
import type Card from "@/module/DurakGame/entity/Card/index.js";
import { type CanReceiveCards } from "@/module/DurakGame/DurakGame.js";

export default class Discard extends Deck implements CanReceiveCards {
  constructor() {
    super();
  }

  receiveCards(...cards: Card[]): void {
    this.value.push(...cards);
  }

  toJSON() {
    return {
      isEmpty: this.isEmpty,
    };
  }
}
