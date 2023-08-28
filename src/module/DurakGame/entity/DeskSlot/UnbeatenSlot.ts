import Card from "../Card";
import { DefendedSlot, DeskSlot } from "./index";

export default class UnbeatenSlot extends DeskSlot {
  constructor(public attackCard: Card) {
    super();
  }

  get value() {
    return [this.attackCard];
  }

  override isUnbeaten(): this is UnbeatenSlot {
    return true;
  }

  override async ensureCanBeAttacked() {
    throw new Error("Слот занят");
  }

  override async ensureCanBeDefended(card: Card) {
    if (card.isTrump) {
      return card;
    }
    if (this.attackCard.suit !== card.suit) {
      throw new Error("Вы кинули неверную масть");
    }
    if (this.attackCard.power > card.power) {
      throw new Error("Вы кинули слабую карту");
    }
    return card;
  }

  override nextDeskSlot(card: Card): DefendedSlot {
    return new DefendedSlot(this.attackCard, card);
  }
}
