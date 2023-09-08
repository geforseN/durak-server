import Card from "../Card/index.js";
import { DeskSlot, UnbeatenSlot, UnbeatenTrumpSlot } from "./index.js";

export default class EmptySlot extends DeskSlot {
  get value(): [] {
    return [];
  }

  override isEmpty(): this is EmptySlot {
    return true;
  }

  override async ensureCanBeAttacked(card: Card) {
    return card;
  }

  override async ensureCanBeDefended() {
    throw new Error("Нет от чего защищаться");
  }

  override async ensureAllowsTransfer(card: Card) {
    return card;
  }

  override nextDeskSlot(card: Card): UnbeatenSlot | UnbeatenTrumpSlot {
    return card.isTrump
      ? new UnbeatenTrumpSlot(this.index, card)
      : new UnbeatenSlot(this.index, card);
  }
}
