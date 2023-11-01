import Card from "../Card";
import { UnbeatenSlot } from "./index";

export default class UnbeatenTrumpSlot extends UnbeatenSlot {
  constructor(public attackCard: Card) {
    super(attackCard);
  }

  override ensureCanBeDefended(card: Card) {
    if (!card.isTrump) {
      return Promise.reject(
        new Error("Козырную карту можно побить только козырной"),
      );
    }
    if (this.attackCard.power > card.power) {
      return Promise.reject(new Error("Вы кинули слабую карту"));
    }
    return Promise.resolve(card);
  }
}
