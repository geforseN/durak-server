import Card from "../Card";
import { DeskSlot, UnbeatenSlot, UnbeatenTrumpSlot } from "./index";

export default class EmptySlot extends DeskSlot {
  constructor() {
    super();
  }

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
    return card.isTrump ? new UnbeatenTrumpSlot(card) : new UnbeatenSlot(card);
  }
}
