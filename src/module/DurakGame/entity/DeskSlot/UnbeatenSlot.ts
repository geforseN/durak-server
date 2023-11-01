import Card from "../Card";
import { DeskSlot } from "./index";

export default class UnbeatenSlot extends DeskSlot {
  constructor(public attackCard: Card) {
    super();
  }

  get value() {
    return [this.attackCard];
  }

  override ensureCanBeAttacked() {
    return Promise.reject(new Error("Слот занят"));
  }

  override ensureCanBeDefended(card: Card) {
    if (card.isTrump) {
      return Promise.resolve(card);
    }
    if (this.attackCard.suit !== card.suit) {
      return Promise.reject(new Error("Вы кинули неверную масть"));
    }
    if (this.attackCard.power > card.power) {
      return Promise.reject(new Error("Вы кинули слабую карту"));
    }
    return Promise.resolve(card);
  }
}
