import Card from "../Card";
import { UnbeatenSlot } from "./index";

export default class UnbeatenTrumpSlot extends UnbeatenSlot {
  constructor(index: number, public attackCard: Card) {
    super(index, attackCard);
  }

  override async ensureCanBeDefended(card: Card) {
    if (!card.isTrump) {
      throw new Error("Козырную карту можно побить только козырной");
    }
    if (this.attackCard.power > card.power) {
      throw new Error("Вы кинули слабую карту");
    }
    return card;
  }
}
