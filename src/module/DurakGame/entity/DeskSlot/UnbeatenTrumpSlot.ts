import Card from "../Card/index.js";
import { UnbeatenSlot } from "./index.js";

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
    return;
  }
}
